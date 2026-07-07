'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import { apiRequest } from '../../../utils/api';
import Link from 'next/link';

export default function AdminForms() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state for creating new form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('0');
  const [status, setStatus] = useState('DRAFT');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchForms = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/forms', {
        params: { page: 1, limit: 100 } // Load all forms for simplified view
      });
      setForms(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách form');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      const newForm = await apiRequest('/forms', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          order: parseInt(order) || 0,
          status,
        }),
      });

      setForms((prev) => [...prev, newForm].sort((a, b) => a.order - b.order));
      setIsModalOpen(false);
      // Reset form fields
      setTitle('');
      setDescription('');
      setOrder('0');
      setStatus('DRAFT');
    } catch (err: any) {
      setModalError(err.message || 'Không thể tạo form mới');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteForm = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa form "${title}"? Tất cả các trường dữ liệu và các lượt submit liên quan sẽ bị xóa.`)) {
      return;
    }

    try {
      await apiRequest(`/forms/${id}`, {
        method: 'DELETE',
      });
      setForms((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      alert(err.message || 'Không thể xóa form');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }} className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Quản lý Form</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Danh sách các form khảo sát trong hệ thống</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            + Tạo Form Mới
          </button>
        </div>

        {error && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
            Đang tải danh sách form...
          </div>
        ) : forms.length === 0 ? (
          <div className="glass" style={{ textAlign: 'center', padding: '64px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '3rem' }}>📂</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '16px', marginBottom: '8px' }}>Chưa có form nào</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Bắt đầu bằng cách tạo form mới để cấu hình khảo sát</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">Tạo Form Đầu Tiên</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {forms.map((form) => (
              <div key={form.id} className="glass" style={{
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '240px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
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
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Thứ tự: {form.order}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {form.title}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    marginBottom: '16px'
                  }}>
                    {form.description || 'Không có mô tả.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <Link href={`/admin/forms/${form.id}`} style={{ flex: 1 }}>
                    <button className="btn-secondary" style={{ width: '100%', padding: '8px 16px', fontSize: '0.85rem' }}>
                      ⚙️ Cấu hình Field
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteForm(form.id, form.title)}
                    className="btn-danger"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Form Modal */}
      {isModalOpen && (
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
          <div className="glass animate-scale-in" style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Tạo Form Mới</h2>

            <form onSubmit={handleCreateForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {modalError && (
                <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  ⚠️ {modalError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tiêu đề Form *</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề form"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mô tả</label>
                <textarea
                  placeholder="Mô tả ngắn gọn về mục đích form này"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Trạng thái</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="DRAFT">Bản nháp (Draft)</option>
                    <option value="ACTIVE">Hoạt động (Active)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '10px 20px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
