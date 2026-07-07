const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function apiRequest<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let url = `${API_BASE_URL}${path}`;
  if (options.params) {
    const query = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      query.append(key, String(val));
    });
    url += `?${query.toString()}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { success: false, error: { message: 'Phản hồi từ server không hợp lệ' } };
  }

  if (!response.ok) {
    // Session expired or invalid
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.clear();
      // Redirect to correct login based on role path if possible
      const pathname = window.location.pathname;
      if (pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/sw/login';
      }
    }

    const errMsg = json.error?.message || response.statusText || 'Đã có lỗi xảy ra';
    const errDetails = json.error?.details || [];
    
    // Throw custom error holding details
    const error: any = new Error(errMsg);
    error.status = response.status;
    error.code = json.error?.code || 'INTERNAL_ERROR';
    error.details = errDetails;
    throw error;
  }

  return json.data;
}
