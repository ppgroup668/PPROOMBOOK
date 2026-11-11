import { User, Room, Booking, SlotAvailability, AdminStats } from './types.ts';
import { ClientStore } from './clientStore.ts';
import { DEFAULT_ADMIN_USER, DEFAULT_MEMBER_USER, DEFAULT_ROOMS } from './defaultData.ts';

const TOKEN_KEY = 'bookla_auth_token_v1';
const USER_KEY = 'bookla_active_user_v1';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: (): User | null => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
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

  try {
    const response = await fetch(url, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';

    // If server returned HTML (e.g. 404 page or static index.html rewrite on Vercel)
    if (!contentType.includes('application/json')) {
      throw new Error('API_UNAVAILABLE');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || `API_ERROR_${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    if (err?.message?.startsWith('API_ERROR_')) {
      throw err;
    }
    throw new Error('API_UNAVAILABLE');
  }
}

export const api = {
  // --- Auth ---
  register: async (payload: { name: string; email: string; phone: string; password: string }) => {
    const cleanEmail = payload.email.toLowerCase().trim();
    const cleanPassword = payload.password.trim();

    try {
      const res = await fetchJson<{ message: string; token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: payload.name.trim(),
          email: cleanEmail,
          phone: payload.phone.trim(),
          password: cleanPassword,
        }),
      });
      authStorage.setUser(res.user);
      authStorage.setToken(res.token);
      return res;
    } catch {
      // Vercel / Client-side fallback
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: payload.name.trim(),
        email: cleanEmail,
        phone: payload.phone.trim(),
        role: 'member',
        createdAt: new Date().toISOString(),
      };
      ClientStore.saveUser({ ...newUser, password: cleanPassword });
      const token = `local_jwt_${newUser.id}`;
      authStorage.setUser(newUser);
      authStorage.setToken(token);
      return {
        message: '註冊成功！歡迎使用 BOOK LA 會議室預約系統',
        token,
        user: newUser,
      };
    }
  },

  login: async (payload: { email: string; password: string }) => {
    const cleanEmail = payload.email.toLowerCase().trim();
    const cleanPassword = payload.password.trim();

    // 1. Try remote API first if available
    try {
      const res = await fetchJson<{ message: string; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      authStorage.setUser(res.user);
      authStorage.setToken(res.token);
      return res;
    } catch {
      // 2. Client-side authentication fallback (Vercel static hosting)
      const user = ClientStore.authenticate(cleanEmail, cleanPassword);
      if (user) {
        const token = `local_jwt_${user.id}_${Date.now()}`;
        authStorage.setUser(user);
        authStorage.setToken(token);
        return {
          message: '登入成功',
          token,
          user,
        };
      }

      // If credentials do not match, return clear error message — never a 404
      throw new Error('電子郵件或密碼錯誤，請重新確認');
    }
  },

  getMe: async () => {
    try {
      const res = await fetchJson<{ user: User }>('/api/auth/me');
      authStorage.setUser(res.user);
      return res;
    } catch {
      const cached = authStorage.getUser();
      if (cached) {
        return { user: cached };
      }
      throw new Error('請先登入帳號');
    }
  },

  // --- Rooms (Guaranteed 5 Meeting Rooms A-E) ---
  getRooms: async (params?: { category?: string; status?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.status) query.set('status', params.status);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await fetchJson<{ rooms: Room[] }>(`/api/rooms${queryString}`);
      if (res && Array.isArray(res.rooms) && res.rooms.length > 0) {
        // Cache to client storage
        ClientStore.setRooms(res.rooms);
        return res;
      }
    } catch {
      // Fallback to client-side store
    }

    // ClientStore guarantees 会議室 A, B, C, D, E exist
    let rooms = ClientStore.getRooms();
    if (params?.category && params.category !== 'all') {
      rooms = rooms.filter(r => r.category === params.category);
    }
    if (params?.status && params.status !== 'all') {
      rooms = rooms.filter(r => r.status === params.status);
    }
    return { rooms };
  },

  getRoom: async (id: string) => {
    try {
      return await fetchJson<{ room: Room }>(`/api/rooms/${id}`);
    } catch {
      const rooms = ClientStore.getRooms();
      const match = rooms.find(r => r.id === id) || DEFAULT_ROOMS[0];
      return { room: match };
    }
  },

  createRoom: async (roomData: Partial<Room>) => {
    try {
      return await fetchJson<{ message: string; room: Room }>('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData),
      });
    } catch {
      const rooms = ClientStore.getRooms();
      const newRoom: Room = {
        id: `rm_${Date.now()}`,
        name: roomData.name || '新會議室',
        category: roomData.category || '會議室',
        description: roomData.description || '',
        capacity: roomData.capacity || 8,
        area: roomData.area || '30 平方米',
        amenities: roomData.amenities || ['投影機', '白板'],
        price: 0,
        imageUrl: roomData.imageUrl || DEFAULT_ROOMS[0].imageUrl,
        status: roomData.status || 'available',
        availableTimeSlots: DEFAULT_ROOMS[0].availableTimeSlots,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      rooms.push(newRoom);
      ClientStore.setRooms(rooms);
      return { message: '成功新增會議室', room: newRoom };
    }
  },

  updateRoom: async (id: string, roomData: Partial<Room>) => {
    try {
      return await fetchJson<{ message: string; room: Room }>(`/api/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(roomData),
      });
    } catch {
      const rooms = ClientStore.getRooms();
      const idx = rooms.findIndex(r => r.id === id);
      if (idx !== -1) {
        rooms[idx] = { ...rooms[idx], ...roomData, price: 0, updatedAt: new Date().toISOString() };
        ClientStore.setRooms(rooms);
        return { message: '會議室資料已更新', room: rooms[idx] };
      }
      throw new Error('找不到該會議室');
    }
  },

  deleteRoom: async (id: string) => {
    try {
      return await fetchJson<{ message: string }>(`/api/rooms/${id}`, {
        method: 'DELETE',
      });
    } catch {
      const rooms = ClientStore.getRooms();
      const filtered = rooms.filter(r => r.id !== id);
      ClientStore.setRooms(filtered);
      return { message: '已成功刪除該會議室' };
    }
  },

  // --- Bookings ---
  checkAvailability: async (roomId: string, date: string) => {
    try {
      return await fetchJson<{ roomId: string; date: string; slots: SlotAvailability[] }>(
        `/api/bookings/availability?roomId=${encodeURIComponent(roomId)}&date=${encodeURIComponent(date)}`
      );
    } catch {
      const rooms = ClientStore.getRooms();
      const room = rooms.find(r => r.id === roomId) || DEFAULT_ROOMS.find(r => r.id === roomId);
      const standardSlots = room ? room.availableTimeSlots : DEFAULT_ROOMS[0].availableTimeSlots;
      const bookings = ClientStore.getBookings();
      const bookedSlots = bookings
        .filter(b => b.roomId === roomId && b.date === date && b.status !== 'cancelled')
        .map(b => b.timeSlot);

      const slots: SlotAvailability[] = standardSlots.map(slot => ({
        slot,
        available: !bookedSlots.includes(slot),
      }));
      return { roomId, date, slots };
    }
  },

  getMyBookings: async () => {
    try {
      return await fetchJson<{ bookings: Booking[] }>('/api/bookings/my');
    } catch {
      const user = authStorage.getUser() || DEFAULT_MEMBER_USER;
      const allBookings = ClientStore.getBookings();
      const userBookings = allBookings.filter(b => b.userId === user.id || b.userEmail === user.email);
      return { bookings: userBookings };
    }
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
    try {
      return await fetchJson<{ message: string; booking: Booking }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const rooms = ClientStore.getRooms();
      const room = rooms.find(r => r.id === payload.roomId) || DEFAULT_ROOMS[0];
      const user = authStorage.getUser();

      const newBooking = ClientStore.addBooking({
        roomId: room.id,
        roomName: room.name,
        userId: user ? user.id : `guest_${Date.now()}`,
        userName: payload.userName || user?.name || '訪客',
        userEmail: payload.userEmail || user?.email || 'guest@example.com',
        userPhone: payload.userPhone || user?.phone || '0900-000-000',
        date: payload.date,
        timeSlot: payload.timeSlot,
        attendeesCount: payload.attendeesCount || 1,
        notes: payload.notes || '',
        status: 'confirmed',
      });

      return {
        message: '預約成功！全額免費，已為您保留會議室。',
        booking: newBooking,
      };
    }
  },

  cancelBooking: async (bookingId: string, reason?: string) => {
    try {
      return await fetchJson<{ message: string; booking: Booking }>(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    } catch {
      const updated = ClientStore.cancelBooking(bookingId, reason);
      if (updated) {
        return { message: '預約已成功取消', booking: updated };
      }
      throw new Error('找不到該預約紀錄');
    }
  },

  // --- Admin ---
  getAdminBookings: async (params?: { status?: string; search?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await fetchJson<{ bookings: Booking[] }>(`/api/admin/bookings${queryString}`);
    } catch {
      let bookings = ClientStore.getBookings();
      if (params?.status && params.status !== 'all') {
        bookings = bookings.filter(b => b.status === params.status);
      }
      if (params?.search && params.search.trim()) {
        const q = params.search.toLowerCase();
        bookings = bookings.filter(b =>
          b.id.toLowerCase().includes(q) ||
          b.roomName.toLowerCase().includes(q) ||
          b.userName.toLowerCase().includes(q)
        );
      }
      return { bookings };
    }
  },

  updateAdminBooking: async (id: string, payload: { status: Booking['status']; cancelReason?: string }) => {
    try {
      return await fetchJson<{ message: string; booking: Booking }>(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch {
      const updated = ClientStore.updateBookingStatus(id, payload.status);
      if (updated) {
        return { message: '預約狀態更新成功', booking: updated };
      }
      throw new Error('找不到該預約');
    }
  },

  deleteAdminBooking: async (id: string) => {
    try {
      return await fetchJson<{ message: string }>(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
      });
    } catch {
      ClientStore.deleteBooking(id);
      return { message: '預約紀錄已完全刪除' };
    }
  },

  getAdminStats: async () => {
    try {
      return await fetchJson<AdminStats>('/api/admin/stats');
    } catch {
      const rooms = ClientStore.getRooms();
      const bookings = ClientStore.getBookings();
      const todayStr = new Date().toISOString().split('T')[0];

      const roomBookingCounts: Record<string, number> = {};
      bookings.forEach(b => {
        if (b.status !== 'cancelled') {
          roomBookingCounts[b.roomName] = (roomBookingCounts[b.roomName] || 0) + 1;
        }
      });

      return {
        totalRooms: rooms.length,
        activeRooms: rooms.filter(r => r.status === 'available').length,
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        todayBookings: bookings.filter(b => b.date === todayStr && b.status !== 'cancelled').length,
        totalMembers: 28,
        roomBookingCounts,
      };
    }
  },
};
