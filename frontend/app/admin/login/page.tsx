'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../../utils/api';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in as admin, redirect to admin dashboard
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (token && role === 'admin') {
      router.push('/admin/forms');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);

      if (data.role === 'admin') {
        router.push('/admin/forms');
      } else {
        setError('Tài khoản này không có quyền quản trị viên. Vui lòng đăng nhập trang nhân viên.');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 50%, var(--primary-light), var(--bg-primary))'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Xin chào Admin</h1>
          <p style={{ fontSize: '0.95rem' }}>Đăng nhập để quản lý Form và xem dữ liệu khảo sát</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Tên tài khoản
            </label>
            <input
              type="text"
              placeholder="Nhập tên tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập quản trị'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/sw/login" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
            Bạn là Nhân viên SW? Đăng nhập tại đây
          </a>
        </div>
      </div>
    </div>
  );
}
