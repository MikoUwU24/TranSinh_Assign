'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import { apiRequest } from '../../../utils/api';
import Link from 'next/link';

export default function SwForms() {
  const [activeForms, setActiveForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActiveForms = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/forms/active');
      setActiveForms(data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách form active');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveForms();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1000px', width: '100%', margin: '0 auto' }} className="animate-fade-in">
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Khảo Sát Khả Dụng</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Chọn một biểu mẫu khảo sát hoặc báo cáo dưới đây để thực hiện điền thông tin</p>
        </div>

        {error && (
          <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
            Đang tải danh sách biểu mẫu...
          </div>
        ) : activeForms.length === 0 ? (
          <div className="glass" style={{ textAlign: 'center', padding: '64px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '3rem' }}>💤</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '16px', marginBottom: '8px' }}>Chưa có biểu mẫu nào hoạt động</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Hiện tại chưa có form nào được xuất bản ở trạng thái hoạt động (Active).</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeForms.map((form) => (
              <div key={form.id} className="glass animate-scale-in" style={{
                padding: '32px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-md)',
                borderLeft: '5px solid var(--primary)',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ flex: 1, paddingRight: '24px' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{form.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                    {form.description || 'Không có mô tả chi tiết.'}
                  </p>
                  
                  <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Số lượng trường cần điền: <strong>{(form.fields || []).length} trường</strong>
                  </div>
                </div>

                <div>
                  <Link href={`/sw/forms/${form.id}`}>
                    <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                      ✏️ Điền Form
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
