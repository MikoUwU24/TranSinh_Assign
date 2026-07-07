'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { apiRequest } from '../../../../utils/api';
import Link from 'next/link';

export default function SwFillForm() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form values state: fieldId -> value string
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  
  // Validation errors from server: fieldId -> error message string
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchFormDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/forms/${formId}`);
      if (data.status !== 'ACTIVE') {
        throw new Error('Biểu mẫu này chưa được kích hoạt hoặc không khả dụng.');
      }
      setForm(data);
      setFields(data.fields || []);
      
      // Initialize default values for each field
      const defaults: Record<string, string> = {};
      data.fields?.forEach((f: any) => {
        if (f.type === 'COLOR') {
          defaults[f.id] = '#ffffff'; // Default hex color
        } else if (f.type === 'SELECT') {
          let opts: string[] = [];
          if (f.options) {
            try {
              opts = typeof f.options === 'string' ? JSON.parse(f.options) : f.options;
            } catch {
              opts = [];
            }
          }
          defaults[f.id] = opts[0] || ''; // Default to first option
        } else {
          defaults[f.id] = '';
        }
      });
      setFormValues(defaults);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết biểu mẫu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchFormDetails();
    }
  }, [formId]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
    
    // Clear validation error when editing the field
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setSubmitting(true);

    // Format request payload
    const answers = Object.entries(formValues).map(([fieldId, value]) => ({
      fieldId,
      value: value === '' ? null : value,
    }));

    try {
      await apiRequest(`/forms/${formId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/sw/submissions');
      }, 2000);
    } catch (err: any) {
      if (err.code === 'VALIDATION_ERROR' && err.details) {
        // Map structured validation errors to display on matching inputs
        const fieldErrors: Record<string, string> = {};
        err.details.forEach((detail: any) => {
          if (detail.field) {
            fieldErrors[detail.field] = detail.message;
          }
        });
        setValidationErrors(fieldErrors);
        setError('Dữ liệu nhập vào chưa chính xác. Vui lòng sửa lại các ô màu đỏ.');
      } else {
        setError(err.message || 'Đã có lỗi hệ thống xảy ra khi nộp form');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '750px', width: '100%', margin: '0 auto' }} className="animate-fade-in">
        <div style={{ marginBottom: '24px' }}>
          <Link href="/sw/forms" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
            ← Quay lại danh sách
          </Link>
        </div>

        {error && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            ⚠️ {error}
          </div>
        )}

        {submitSuccess && (
          <div style={{ padding: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '24px', textAlign: 'center' }}>
            🎉 <strong>Nộp form thành công!</strong> Đang chuyển hướng bạn về trang lịch sử...
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
            Đang tải biểu mẫu...
          </div>
        ) : !form ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>Biểu mẫu không tồn tại</div>
        ) : (
          <div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{form.title}</h1>
              <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{form.description || 'Vui lòng điền đầy đủ các thông tin theo yêu cầu.'}</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {fields.map((field) => {
                const isInvalid = !!validationErrors[field.id];
                const errorMsg = validationErrors[field.id];

                // Parse options if SELECT
                let fieldOptions: string[] = [];
                if (field.type === 'SELECT' && field.options) {
                  try {
                    fieldOptions = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
                  } catch {
                    fieldOptions = [];
                  }
                }

                return (
                  <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                      {field.label} {field.required && <span style={{ color: 'var(--error)' }}>*</span>}
                    </label>

                    {/* TEXT FIELD */}
                    {field.type === 'TEXT' && (
                      <input
                        type="text"
                        placeholder="Nhập câu trả lời..."
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        disabled={submitting || submitSuccess}
                        style={{
                          borderColor: isInvalid ? 'var(--error)' : undefined,
                          backgroundColor: isInvalid ? 'rgba(239, 68, 68, 0.03)' : undefined
                        }}
                      />
                    )}

                    {/* NUMBER FIELD */}
                    {field.type === 'NUMBER' && (
                      <input
                        type="number"
                        placeholder="Nhập số từ 0 - 100..."
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        disabled={submitting || submitSuccess}
                        style={{
                          borderColor: isInvalid ? 'var(--error)' : undefined,
                          backgroundColor: isInvalid ? 'rgba(239, 68, 68, 0.03)' : undefined
                        }}
                      />
                    )}

                    {/* DATE FIELD */}
                    {field.type === 'DATE' && (
                      <input
                        type="date"
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        disabled={submitting || submitSuccess}
                        style={{
                          borderColor: isInvalid ? 'var(--error)' : undefined,
                          backgroundColor: isInvalid ? 'rgba(239, 68, 68, 0.03)' : undefined
                        }}
                      />
                    )}

                    {/* COLOR FIELD */}
                    {field.type === 'COLOR' && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={formValues[field.id] || '#ffffff'}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          disabled={submitting || submitSuccess}
                          style={{
                            width: '64px',
                            cursor: 'pointer',
                            borderColor: isInvalid ? 'var(--error)' : undefined
                          }}
                        />
                        <code style={{ fontSize: '0.9rem' }}>{formValues[field.id] || '#ffffff'}</code>
                      </div>
                    )}

                    {/* SELECT FIELD */}
                    {field.type === 'SELECT' && (
                      <select
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        disabled={submitting || submitSuccess}
                        style={{
                          borderColor: isInvalid ? 'var(--error)' : undefined,
                          backgroundColor: isInvalid ? 'rgba(239, 68, 68, 0.03)' : undefined
                        }}
                      >
                        {fieldOptions.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Error display under the field */}
                    {isInvalid && (
                      <span style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: 500 }}>
                        ⚠️ {errorMsg}
                      </span>
                    )}
                  </div>
                );
              })}

              <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                <Link href="/sw/forms" style={{ flex: 1 }}>
                  <button type="button" className="btn-secondary" style={{ width: '100%' }}>
                    Hủy bỏ
                  </button>
                </Link>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2 }}
                  disabled={submitting || submitSuccess}
                >
                  {submitting ? 'Đang gửi...' : 'Nộp biểu mẫu'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
