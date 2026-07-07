'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [theme, setTheme] = useState<string>('light');
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    // Read theme
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(activeTheme);

    // Read user
    setUsername(localStorage.getItem('username') || '');
    setRole(localStorage.getItem('role') || '');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleLogout = () => {
    localStorage.clear();
    if (role === 'admin') {
      router.push('/admin/login');
    } else {
      router.push('/sw/login');
    }
  };

  return (
    <nav className="glass" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderRadius: 0,
      backdropFilter: 'blur(16px)',
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link href={role === 'admin' ? '/admin/forms' : '/sw/forms'} style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--primary), #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
        }}>
          💡 FormBuilder
        </Link>
        
        {role === 'admin' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/admin/forms" style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}>
              Quản lý Form
            </Link>
            <Link href="/admin/submissions" style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}>
              Xem Submission
            </Link>
          </div>
        )}

        {role === 'sw' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/sw/forms" style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}>
              Form Khả dụng
            </Link>
            <Link href="/sw/submissions" style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}>
              Lịch sử đã nộp
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: role === 'admin' ? 'var(--primary)' : 'var(--success)'
            }}></span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {username} <strong style={{ textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.8 }}>({role})</strong>
            </span>
          </div>
        )}

        <button 
          onClick={toggleTheme} 
          style={{
            background: 'none',
            fontSize: '1.2rem',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)'
          }}
          title="Đổi giao diện"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {username && (
          <button 
            onClick={handleLogout} 
            className="btn-secondary" 
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
          >
            Đăng xuất
          </button>
        )}
      </div>
    </nav>
  );
}
