'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(activeTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 50%, var(--primary-light), var(--bg-primary))',
      position: 'relative'
    }}>
      <button 
        onClick={toggleTheme} 
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'none',
          fontSize: '1.2rem',
          padding: '8px',
          borderRadius: '50%',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div style={{ textAlign: 'center', maxWidth: '600px', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, var(--primary), #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          letterSpacing: '-0.04em'
        }}>
          Dynamic Form Builder
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
          Hệ thống xây dựng form động tối giản, tinh tế và chuyên nghiệp. Tạo form nhanh chóng, validate dữ liệu thông minh trên server và thu thập báo cáo tức thì.
        </p>
      </div>

      <div className="form-grid-responsive" style={{
        width: '100%',
        maxWidth: '700px'
      }}>
        {/* Admin portal card */}
        <Link href="/login" className="glass animate-scale-in card-responsive" style={{
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'transform 0.2s, border-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <h2 style={{ fontSize: '1.5rem' }}>Quản trị viên (Admin)</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Tạo mới form, cấu hình các trường dữ liệu động, thiết lập điều kiện validate và kiểm tra kết quả khảo sát từ nhân viên.
          </p>
        </Link>

        {/* SW portal card */}
        <Link href="/login" className="glass animate-scale-in card-responsive" style={{
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'transform 0.2s, border-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--success)';
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <h2 style={{ fontSize: '1.5rem' }}>Nhân viên (SW)</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Xem danh sách các form khảo sát đang hoạt động, điền thông tin báo cáo định kỳ và xem lịch sử các lượt nộp của mình.
          </p>
        </Link>
      </div>

      <div style={{ marginTop: '64px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        © 2026 TranSinh Dynamic Form Builder. Mọi quyền được bảo lưu.
      </div>
    </div>
  );
}
