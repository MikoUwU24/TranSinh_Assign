'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { apiRequest } from '../../../../utils/api';
import Link from 'next/link';

export default function FormDetail() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form edit states
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editOrder, setEditOrder] = useState('0');
  const [editStatus, setEditStatus] = useState('DRAFT');
  const [formUpdating, setFormUpdating] = useState(false);

  // Field modal states
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOrder, setFieldOrder] = useState('0');
  const [optionInput, setOptionInput] = useState('');
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [fieldModalError, setFieldModalError] = useState('');
  const [fieldSubmitting, setFieldSubmitting] = useState(false);

  const fetchFormDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/forms/${formId}`);
      setForm(data);
      setFields(data.fields || []);
      
      // Init edit fields
      setEditTitle(data.title);
      setEditDesc(data.description || '');
      setEditOrder(String(data.order));
      setEditStatus(data.status);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin form');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchFormDetails();
    }
  }, [formId]);

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormUpdating(true);
    try {
      const updatedForm = await apiRequest(`/forms/${formId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          order: parseInt(editOrder) || 0,
          status: editStatus,
        }),
      });
      setForm(updatedForm);
      setIsEditingForm(false);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật form');
    } finally {
      setFormUpdating(false);
    }
  };

  const openAddFieldModal = () => {
    setEditingFieldId(null);
    setFieldLabel('');
    setFieldType('TEXT');
    setFieldRequired(false);
    setFieldOrder(String(fields.length));
    setOptionsList([]);
    setOptionInput('');
    setFieldModalError('');
    setIsFieldModalOpen(true);
  };

  const openEditFieldModal = (field: any) => {
    setEditingFieldId(field.id);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setFieldOrder(String(field.order));
    
    let opts: string[] = [];
    if (field.options) {
      try {
        opts = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
      } catch {
        opts = [];
      }
    }
    setOptionsList(opts);
    setOptionInput('');
    setFieldModalError('');
    setIsFieldModalOpen(true);
  };

  const addOption = () => {
    const trimmed = optionInput.trim();
    if (trimmed && !optionsList.includes(trimmed)) {
      setOptionsList((prev) => [...prev, trimmed]);
      setOptionInput('');
    }
  };

  const removeOption = (indexToRemove: number) => {
    setOptionsList((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldModalError('');

    if (!fieldLabel.trim()) {
      setFieldModalError('Nhãn trường (label) không được để trống');
      return;
    }

    if (fieldType === 'SELECT' && optionsList.length === 0) {
      setFieldModalError('Vui lòng nhập ít nhất 1 option cho trường loại SELECT');
      return;
    }

    setFieldSubmitting(true);
    const body = {
      label: fieldLabel.trim(),
      type: fieldType,
      required: fieldRequired,
      order: parseInt(fieldOrder) || 0,
      options: fieldType === 'SELECT' ? optionsList : undefined,
    };

    try {
      if (editingFieldId) {
        // Update field
        const updated = await apiRequest(`/forms/${formId}/fields/${editingFieldId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        setFields((prev) => prev.map((f) => f.id === editingFieldId ? updated : f).sort((a, b) => a.order - b.order));
      } else {
        // Create field
        const created = await apiRequest(`/forms/${formId}/fields`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        setFields((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      }
      setIsFieldModalOpen(false);
    } catch (err: any) {
      setFieldModalError(err.message || 'Không thể lưu trường dữ liệu');
    } finally {
      setFieldSubmitting(false);
    }
  };

  const handleDeleteField = async (fieldId: string, label: string) => {
    if (!confirm(`Bạn có muốn xóa trường "${label}"? Nếu trường này đã có lượt nộp, hệ thống sẽ ẩn nó đi thay vì xóa vĩnh viễn (Soft-delete).`)) {
      return;
    }

    try {
      await apiRequest(`/forms/${formId}/fields/${fieldId}`, {
        method: 'DELETE',
      });
      // Refresh list to see either soft deletion effect or hard deletion
      fetchFormDetails();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa trường');
    }
  };

  const moveField = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    // Swap order property in array
    const updatedFields = [...fields];
    const tempOrder = updatedFields[index].order;
    updatedFields[index].order = updatedFields[targetIndex].order;
    updatedFields[targetIndex].order = tempOrder;

    // Sort again
    updatedFields.sort((a, b) => a.order - b.order);

    // Call reorder API in backend
    try {
      await apiRequest(`/forms/${formId}/fields/reorder`, {
        method: 'PUT',
        body: JSON.stringify({
          fields: updatedFields.map((f, idx) => ({ id: f.id, order: idx })),
        }),
      });
      
      // Update local state with sequential orders
      setFields(updatedFields.map((f, idx) => ({ ...f, order: idx })));
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật thứ tự trường');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }} className="animate-fade-in">
        <div style={{ marginBottom: '24px' }}>
          <Link href="/admin/forms" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
            Quay lại danh sách Form
          </Link>
        </div>

        {error && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
            Đang tải thông tin form...
          </div>
        ) : !form ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>Form không tồn tại</div>
        ) : (
          <div className="responsive-grid-2col" style={{ alignItems: 'flex-start' }}>
            
            {/* Left Column: Form Details & Actions */}
            <div className="glass card-responsive" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
              {!isEditingForm ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '100px',
                      backgroundColor: form.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'var(--primary-light)',
                      color: form.status === 'ACTIVE' ? 'var(--success)' : 'var(--primary)',
                    }}>
                      {form.status === 'ACTIVE' ? 'Hoạt động' : 'Bản nháp'}
                    </span>
                    <button onClick={() => setIsEditingForm(true)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Sửa Form
                    </button>
                  </div>

                  <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>{form.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', whiteSpace: 'pre-line' }}>{form.description || 'Không có mô tả.'}</p>
                  
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Thứ tự hiển thị:</span> <strong>{form.order}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Ngày tạo:</span> <strong>{new Date(form.createdAt).toLocaleDateString('vi-VN')}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Chỉnh Sửa Form</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tiêu đề *</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Mô tả</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Thứ tự hiển thị</label>
                    <input
                      type="number"
                      min={0}
                      value={editOrder}
                      onChange={(e) => setEditOrder(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Trạng thái</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                      <option value="DRAFT">Bản nháp (Draft)</option>
                      <option value="ACTIVE">Hoạt động (Active)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setIsEditingForm(false)} className="btn-secondary" style={{ flex: 1, padding: '10px' }}>
                      Hủy
                    </button>
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }} disabled={formUpdating}>
                      {formUpdating ? 'Đang lưu...' : 'Lưu lại'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Fields Configuration */}
            <div className="glass card-responsive" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.5rem' }}>Trường Dữ Liệu ({fields.length})</h3>
                <button onClick={openAddFieldModal} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Thêm Trường
                </button>
              </div>

              {fields.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  Chưa cấu hình trường dữ liệu nào. Nhấp "+ Thêm Trường" để bắt đầu.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {fields.map((field, index) => {
                    let fieldOptions: string[] = [];
                    if (field.options) {
                      try {
                        fieldOptions = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
                      } catch {
                        fieldOptions = [];
                      }
                    }

                    return (
                      <div key={field.id} className="glass" style={{
                        padding: '20px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-secondary)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '1.05rem' }}>{field.label}</strong>
                            {field.required && (
                              <span style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: 'bold' }}>* Bắt buộc</span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                            <span>Loại: <code style={{ backgroundColor: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>{field.type}</code></span>
                            <span>Thứ tự: <strong>{field.order}</strong></span>
                            {field.type === 'SELECT' && (
                              <span>Lựa chọn: <strong>{fieldOptions.join(', ')}</strong></span>
                            )}
                          </div>
                        </div>

                        {/* Field Action Buttons (Reorder, Edit, Delete) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          
                          {/* Reorder Buttons */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              disabled={index === 0}
                              onClick={() => moveField(index, 'up')}
                              style={{ padding: '2px 6px', fontSize: '0.75rem', opacity: index === 0 ? 0.3 : 1 }}
                              className="btn-secondary"
                              title="Di chuyển lên"
                            >
                              ▲
                            </button>
                            <button
                              disabled={index === fields.length - 1}
                              onClick={() => moveField(index, 'down')}
                              style={{ padding: '2px 6px', fontSize: '0.75rem', opacity: index === fields.length - 1 ? 0.3 : 1 }}
                              className="btn-secondary"
                              title="Di chuyển xuống"
                            >
                              ▼
                            </button>
                          </div>

                          <button
                            onClick={() => openEditFieldModal(field)}
                            className="btn-secondary"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            title="Sửa"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id, field.label)}
                            className="btn-danger"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            title="Xóa"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Field Editor Modal */}
      {isFieldModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="glass animate-scale-in modal-responsive" style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>
              {editingFieldId ? 'Cập Nhật Trường Dữ Liệu' : 'Thêm Trường Dữ Liệu Mới'}
            </h2>

            <form onSubmit={handleSaveField} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {fieldModalError && (
                <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  {fieldModalError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tên hiển thị (Label) *</label>
                <input
                  type="text"
                  placeholder="Nhập tên trường hiển thị (ví dụ: Số điện thoại, Địa chỉ...)"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loại dữ liệu</label>
                  <select value={fieldType} onChange={(e) => setFieldType(e.target.value)} disabled={!!editingFieldId}>
                    <option value="TEXT">Văn bản (Text)</option>
                    <option value="NUMBER">Số (Number)</option>
                    <option value="DATE">Ngày tháng (Date)</option>
                    <option value="COLOR">Mã màu (Color)</option>
                    <option value="SELECT">Lựa chọn (Select)</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={0}
                    value={fieldOrder}
                    onChange={(e) => setFieldOrder(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="required-checkbox"
                  checked={fieldRequired}
                  onChange={(e) => setFieldRequired(e.target.checked)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="required-checkbox" style={{ fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                  Bắt buộc nhập dữ liệu này (Required)
                </label>
              </div>

              {/* Select Options configuration */}
              {fieldType === 'SELECT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Danh sách lựa chọn (Options)</label>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Thêm lựa chọn mới"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addOption();
                        }
                      }}
                    />
                    <button type="button" onClick={addOption} className="btn-primary" style={{ padding: '8px 16px' }}>
                      +
                    </button>
                  </div>

                  {optionsList.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chưa có lựa chọn nào</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {optionsList.map((opt, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '4px 10px',
                          borderRadius: '100px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.85rem'
                        }}>
                          <span>{opt}</span>
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            style={{ background: 'none', color: 'var(--error)', fontWeight: 'bold', fontSize: '0.9rem', padding: '2px' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsFieldModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '10px 20px' }}
                  disabled={fieldSubmitting}
                >
                  {fieldSubmitting ? 'Đang lưu...' : 'Lưu Trường'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
