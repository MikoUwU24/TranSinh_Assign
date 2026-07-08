'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SwLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)'
    }}>
      Đang chuyển hướng đến trang đăng nhập...
    </div>
  );
}
