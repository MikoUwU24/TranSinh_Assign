'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../utils/api';

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (username.length < 3) {
      setError('Tên tài khoản phải dài ít nhất 3 ký tự');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải dài ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          role: 'sw', // Mặc định đăng ký là nhân viên SW để điền biểu mẫu
        }),
      });

      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Tên tài khoản có thể đã tồn tại.');
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
      <div className="glass card-responsive" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Đăng ký</h1>
          <p style={{ fontSize: '0.95rem' }}>Đăng ký tài khoản Nhân viên mới để điền biểu mẫu</p>
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
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--success)',
              color: 'var(--success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Tên tài khoản
            </label>
            <input
              type="text"
              placeholder="Ít nhất 3 ký tự"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading || !!success}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || !!success}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || !!success}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !!success}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Đã có tài khoản? </span>
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Đăng nhập ngay
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
