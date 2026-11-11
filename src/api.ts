import { User, Room, Booking, SlotAvailability, AdminStats, SchemaDocs } from './types.ts';

const TOKEN_KEY = 'bookjor_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err: any) {
    throw new Error('伺服器連線中斷或網路異常，請稍後再試');
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '');
    if (!response.ok) {
      throw new Error(`伺服器暫時無法處理請求 (${response.status})，請重新登入或稍後再試`);
    }
    // If somehow a 200 returned HTML
    throw new Error('伺服器回應格式異常');
  }

  let data: any;
  try {
    data = await response.json();
  } catch (_e) {
    throw new Error('回應資料格式解析失敗，請稍後重試');
  }

  if (!response.ok) {
    throw new Error(data?.error || `請求失敗 (${response.status})，請確認輸入資料`);
  }

  return data as T;
}

export const api = {
  // --- Auth ---
  register: async (payload: { name: string; email: string; phone: string; password: string }) => {
    return fetchJson<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login: async (payload: { email: string; password: string }) => {
    return fetchJson<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async () => {
    return fetchJson<{ user: User }>('/api/auth/me');
  },

  // --- Rooms ---
  getRooms: async (params?: { category?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{ rooms: Room[] }>(`/api/rooms${queryString}`);
  },

  getRoom: async (id: string) => {
    return fetchJson<{ room: Room }>(`/api/rooms/${id}`);
  },

  createRoom: async (roomData: Partial<Room>) => {
    return fetchJson<{ message: string; room: Room }>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  updateRoom: async (id: string, roomData: Partial<Room>) => {
    return fetchJson<{ message: string; room: Room }>(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  },

  deleteRoom: async (id: string) => {
    return fetchJson<{ message: string }>(`/api/rooms/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Bookings ---
  checkAvailability: async (roomId: string, date: string) => {
    return fetchJson<{ roomId: string; date: string; slots: SlotAvailability[] }>(
      `/api/bookings/availability?roomId=${encodeURIComponent(roomId)}&date=${encodeURIComponent(date)}`
    );
  },

  getMyBookings: async () => {
    return fetchJson<{ bookings: Booking[] }>('/api/bookings/my');
  },

  createBooking: async (payload: {
    roomId: string;
    date: string;
    timeSlot: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    attendeesCount?: number;
    notes?: string;
  }) => {
    return fetchJson<{ message: string; booking: Booking }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  cancelBooking: async (bookingId: string, reason?: string) => {
    return fetchJson<{ message: string; booking: Booking }>(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // --- Admin ---
  getAdminBookings: async (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{ bookings: Booking[] }>(`/api/admin/bookings${queryString}`);
  },

  updateAdminBooking: async (id: string, payload: { status: Booking['status']; cancelReason?: string }) => {
    return fetchJson<{ message: string; booking: Booking }>(`/api/admin/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteAdminBooking: async (id: string) => {
    return fetchJson<{ message: string }>(`/api/admin/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  getAdminStats: async () => {
    return fetchJson<AdminStats>('/api/admin/stats');
  },

  // --- Schema Docs ---
  getSchemaDocs: async () => {
    return fetchJson<SchemaDocs>('/api/system/schema-docs');
  },
};
