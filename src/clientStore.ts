import { Room, Booking, User } from './types.ts';
import { DEFAULT_ROOMS, DEFAULT_ADMIN_USER, DEFAULT_MEMBER_USER, DEFAULT_BOOKINGS } from './defaultData.ts';

const ROOMS_KEY = 'bookla_rooms_data_v1';
const BOOKINGS_KEY = 'bookla_bookings_data_v1';
const USERS_KEY = 'bookla_users_data_v1';

export interface StoredUser extends User {
  password?: string;
}

export class ClientStore {
  static getRooms(): Room[] {
    try {
      const stored = localStorage.getItem(ROOMS_KEY);
      if (stored) {
        const parsed: Room[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify that meeting rooms A-E exist; if missing, merge them
          const missingRooms = DEFAULT_ROOMS.filter(dr => !parsed.some(r => r.name === dr.name || r.id === dr.id));
          if (missingRooms.length > 0) {
            const merged = [...parsed, ...missingRooms];
            this.setRooms(merged);
            return merged;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading rooms from storage:', e);
    }
    // Default fallback: Always Meeting Rooms A-E
    this.setRooms(DEFAULT_ROOMS);
    return DEFAULT_ROOMS;
  }

  static setRooms(rooms: Room[]) {
    try {
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    } catch (e) {
      console.warn('Error saving rooms to storage:', e);
    }
  }

  static getBookings(): Booking[] {
    try {
      const stored = localStorage.getItem(BOOKINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading bookings:', e);
    }
    this.setBookings(DEFAULT_BOOKINGS);
    return DEFAULT_BOOKINGS;
  }

  static setBookings(bookings: Booking[]) {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.warn('Error saving bookings:', e);
    }
  }

  static addBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking {
    const bookings = this.getBookings();
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      ...booking,
      id: `BK${dateCode}-${randCode}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bookings.unshift(newBooking);
    this.setBookings(bookings);
    return newBooking;
  }

  static cancelBooking(id: string, reason?: string): Booking | null {
    const bookings = this.getBookings();
    const target = bookings.find(b => b.id === id);
    if (!target) return null;
    target.status = 'cancelled';
    target.cancelReason = reason || '會員線上取消';
    target.updatedAt = new Date().toISOString();
    this.setBookings(bookings);
    return target;
  }

  static updateBookingStatus(id: string, status: Booking['status']): Booking | null {
    const bookings = this.getBookings();
    const target = bookings.find(b => b.id === id);
    if (!target) return null;
    target.status = status;
    target.updatedAt = new Date().toISOString();
    this.setBookings(bookings);
    return target;
  }

  static deleteBooking(id: string): boolean {
    const bookings = this.getBookings();
    const filtered = bookings.filter(b => b.id !== id);
    this.setBookings(filtered);
    return true;
  }

  static findUser(email: string): User | null {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'ppgroup668@gmail.com' || cleanEmail === 'admin@bookla.com' || cleanEmail === 'admin@bookjor.com') {
      return DEFAULT_ADMIN_USER;
    }
    if (cleanEmail === 'user@example.com') {
      return DEFAULT_MEMBER_USER;
    }
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) {
        const users: StoredUser[] = JSON.parse(stored);
        const match = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (match) {
          const { password: _p, ...userObj } = match;
          return userObj;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  static authenticate(email: string, password: string): User | null {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // 1. Admin login credentials check
    if (
      (cleanEmail === 'ppgroup668@gmail.com' || cleanEmail === 'admin@bookla.com' || cleanEmail === 'admin@bookjor.com') &&
      cleanPassword === '668668'
    ) {
      return DEFAULT_ADMIN_USER;
    }

    // 2. Default test member check
    if (cleanEmail === 'user@example.com' && (cleanPassword === 'user123' || cleanPassword === '668668')) {
      return DEFAULT_MEMBER_USER;
    }

    // 3. Stored user check
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) {
        const users: StoredUser[] = JSON.parse(stored);
        const match = users.find(u => u.email.toLowerCase().trim() === cleanEmail);
        if (match && match.password === cleanPassword) {
          const { password: _p, ...userObj } = match;
          return userObj;
        }
      }
    } catch (e) {
      console.warn('Error reading stored users:', e);
    }

    return null;
  }

  static saveUser(user: StoredUser) {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      const users: StoredUser[] = stored ? JSON.parse(stored) : [];
      const cleanEmail = user.email.toLowerCase().trim();
      const existingIdx = users.findIndex(u => u.email.toLowerCase().trim() === cleanEmail);
      if (existingIdx !== -1) {
        users[existingIdx] = { ...users[existingIdx], ...user };
      } else {
        users.push(user);
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Error saving user:', e);
    }
  }
}
