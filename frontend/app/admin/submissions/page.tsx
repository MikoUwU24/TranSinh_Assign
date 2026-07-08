'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import { apiRequest } from '../../../utils/api';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected submission details state
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/submissions', {
        params: { page: 1, limit: 100 }
      });
      setSubmissions(data.items || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách submission');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }} className="animate-fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Dữ liệu Khảo Sát</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Danh sách các biểu mẫu đã được nhân viên submit lên hệ thống</p>
        </div>

        {error && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
            Đang tải danh sách submission...
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass card-responsive" style={{ textAlign: 'center', padding: '64px', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', marginTop: '16px', marginBottom: '8px' }}>Chưa có lượt nộp nào</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Các biểu mẫu sau khi được nhân viên điền và submit sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="responsive-grid-2col" style={{ alignItems: 'flex-start' }}>
            
            {/* Left Box: List of Submissions */}
            <div className="glass card-responsive" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Lượt Nộp ({submissions.length})</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {submissions.map((sub) => {
                  const dateStr = new Date(sub.createdAt).toLocaleString('vi-VN');
                  const isSelected = selectedSub?.id === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className="glass"
                      style={{
                        padding: '18px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                        transition: 'all 0.2s',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '1.1rem' }}>{sub.form?.title || 'Form không tên'}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dateStr}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Người nộp: <strong style={{ color: 'var(--text-primary)' }}>{sub.submittedBy || 'Nặc danh'}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Box: Submission Details Panel */}
            <div className="glass card-responsive" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', minHeight: '300px', position: 'sticky', top: '90px' }}>
              {!selectedSub ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '240px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  <p style={{ marginTop: '12px' }}>Chọn một lượt nộp từ danh sách bên trái để xem nội dung câu trả lời chi tiết</p>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Chi Tiết Câu Trả Lời</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Nộp bởi <strong>{selectedSub.submittedBy || 'Nặc danh'}</strong> vào {new Date(selectedSub.createdAt).toLocaleString('vi-VN')}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {selectedSub.answers?.map((ans: any) => {
                      const value = ans.value;
                      const label = ans.field?.label || 'Trường dữ liệu';
                      const type = ans.field?.type || 'TEXT';

                      return (
                        <div key={ans.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {label}
                          </span>
                          
                          {type === 'COLOR' && value ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                backgroundColor: value,
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)'
                              }}></span>
                              <code style={{ fontSize: '0.9rem' }}>{value}</code>
                            </div>
                          ) : (
                            <div style={{
                              padding: '12px 16px',
                              backgroundColor: 'var(--bg-primary)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.95rem',
                              borderLeft: '4px solid var(--primary)'
                            }}>
                              {value === null || value === '' ? (
                                <em style={{ color: 'var(--text-muted)' }}>Để trống</em>
                              ) : (
                                <span>{value}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
