import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  category: string;
  description: string;
  capacity: number;
  area: string;
  amenities: string[];
  price: number; // Always 0 for free reservation
  imageUrl: string;
  status: 'available' | 'maintenance' | 'offline';
  availableTimeSlots: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string; // e.g. BK20261110-8921
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '14:00 - 16:00'
  attendeesCount: number;
  notes: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseData {
  users: User[];
  rooms: Room[];
  bookings: Booking[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Default initial data
function getDefaultData(): DatabaseData {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const memberPasswordHash = bcrypt.hashSync('user123', 10);

  const now = new Date().toISOString();
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Future dates for sample bookings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 3);
  const in3DaysStr = in3Days.toISOString().split('T')[0];

  const users: User[] = [
    {
      id: 'usr_admin',
      name: '系統管理員 (Admin)',
      email: 'admin@bookla.com',
      phone: '0912-345-678',
      passwordHash: adminPasswordHash,
      role: 'admin',
      createdAt: now,
    },
    {
      id: 'usr_member1',
      name: '陳小華 (Member)',
      email: 'user@example.com',
      phone: '0988-765-432',
      passwordHash: memberPasswordHash,
      role: 'member',
      createdAt: now,
    },
    {
      id: 'usr_member2',
      name: '林美玲',
      email: 'meiling@example.com',
      phone: '0922-111-222',
      passwordHash: memberPasswordHash,
      role: 'member',
      createdAt: now,
    }
  ];

  const standardSlots = [
    '09:00 - 11:00',
    '11:00 - 13:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '19:00 - 21:00'
  ];

  const rooms: Room[] = [
    {
      id: 'rm_meeting_a',
      name: '會議室 A',
      category: '高階會議室',
      description: '大氣沉穩的現代企業董事會議室，配備 85 吋 4K 觸控電子白板、Bose 陣列視訊追蹤麥克風、人體工學皮椅與高速光纖 Wi-Fi 6，適合跨國視訊洽談與決策會議。',
      capacity: 16,
      area: '55 平方米 (約 16.6 坪)',
      amenities: ['85 吋 4K 觸控電子白板', '4K 廣角視訊追蹤鏡頭', '無線投影傳輸器', '高速 Wi-Fi 6', 'Nespresso 膠囊咖啡', '獨立隔音門窗'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rm_meeting_b',
      name: '會議室 B',
      category: '專案會議室',
      description: '為敏捷專案小組設計的高效協作空間，配備 65 吋 4K 顯示螢幕、全落地式雙面磁吸玻璃白板、無線傳屏與多功能擴充接口，滿足團隊日常研討與腦力激盪。',
      capacity: 10,
      area: '35 平方米 (約 10.5 坪)',
      amenities: ['65 吋 4K 顯示螢幕', '全落地式雙面玻璃白板', '無線螢幕分享器', '人體工學辦公椅', '多功能電源插座', '冷熱飲用水機'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rm_meeting_c',
      name: '會議室 C',
      category: '小組討論室',
      description: '精緻舒適的頭腦風暴與小組研討空間，配備 55 吋智慧螢幕、移動式白板、便利貼套件組與靈活拼裝桌椅，為團隊注入無限創意靈感。',
      capacity: 6,
      area: '24 平方米 (約 7.2 坪)',
      amenities: ['55 吋智慧電視螢幕', '移動式磁吸白板', '研討便利貼套件組', '彈性組合拼接桌椅', '超靜音獨立空調', '高速無線網路'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rm_meeting_d',
      name: '會議室 D',
      category: '視訊會議室',
      description: '專為線上遠端視訊與跨國電話會議打造的頂級聲學靜音室，搭載專業定向收音麥克風陣列、抗干擾雙螢幕顯示與全遮光隔音吸音壁板。',
      capacity: 8,
      area: '30 平方米 (約 9 坪)',
      amenities: ['專用視訊會議主機', '4K 雙鏡頭自動跟焦', '天花板矩陣收音麥克風', '聲學吸音隔音牆板', '抗眩光防疲勞照明', 'Type-C 萬用擴充塢'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rm_meeting_e',
      name: '會議室 E',
      category: '大型多功能室',
      description: '寬敞開揚的多功能大型培訓與論壇會議廳，配備 120 吋電動高畫質投影布幕、雷射高清投影系統、JBL 無線手持麥克風，可彈性佈置為課堂式或劇場式。',
      capacity: 25,
      area: '75 平方米 (約 22.7 坪)',
      amenities: ['120 吋電動高畫質投影幕', '雷射高流明投影機', 'JBL 無線麥克風 x2', '可折疊移動培訓桌椅組', '專用演講台與音響系統', '專屬茶水吧檯'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    }
  ];

  const bookings: Booking[] = [
    {
      id: 'BK20261110-8021',
      roomId: 'rm_meeting_a',
      roomName: '會議室 A',
      userId: 'usr_member1',
      userName: '陳小華 (Member)',
      userEmail: 'user@example.com',
      userPhone: '0988-765-432',
      date: todayStr,
      timeSlot: '14:00 - 16:00',
      attendeesCount: 6,
      notes: '季度跨部門戰略評估會議，需準備無線投影。',
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'BK20261111-9314',
      roomId: 'rm_meeting_b',
      roomName: '會議室 B',
      userId: 'usr_member1',
      userName: '陳小華 (Member)',
      userEmail: 'user@example.com',
      userPhone: '0988-765-432',
      date: tomorrowStr,
      timeSlot: '09:00 - 11:00',
      attendeesCount: 8,
      notes: '產品開發進度研討，需使用白板。',
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'BK20261113-1045',
      roomId: 'rm_meeting_d',
      roomName: '會議室 D',
      userId: 'usr_member2',
      userName: '林美玲',
      userEmail: 'meiling@example.com',
      userPhone: '0922-111-222',
      date: in3DaysStr,
      timeSlot: '16:00 - 18:00',
      attendeesCount: 4,
      notes: '遠端客戶跨國視訊洽談，自備筆電。',
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    }
  ];

  return { users, rooms, bookings };
}

class Database {
  private data: DatabaseData;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.users && parsed.rooms && parsed.bookings) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse database file, falling back to defaults:', err);
    }

    const defaultData = getDefaultData();
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave?: DatabaseData) {
    try {
      this.ensureDirectory();
      const payload = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // --- Users ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    const q = email.toLowerCase().trim();
    return this.data.users.find(u => {
      const uEmail = u.email.toLowerCase();
      if (uEmail === q) return true;
      if ((q === 'admin@bookla.com' || q === 'admin@bookjor.com') && (uEmail === 'admin@bookla.com' || uEmail === 'admin@bookjor.com')) {
        return true;
      }
      return false;
    });
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  // --- Rooms ---
  getRooms(): Room[] {
    return this.data.rooms;
  }

  getRoomById(id: string): Room | undefined {
    return this.data.rooms.find(r => r.id === id);
  }

  createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Room {
    const now = new Date().toISOString();
    const newRoom: Room = {
      ...roomData,
      id: `rm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      price: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.data.rooms.push(newRoom);
    this.saveData();
    return newRoom;
  }

  updateRoom(id: string, updates: Partial<Omit<Room, 'id' | 'createdAt'>>): Room | null {
    const index = this.data.rooms.findIndex(r => r.id === id);
    if (index === -1) return null;

    const updated: Room = {
      ...this.data.rooms[index],
      ...updates,
      price: 0, // Enforce free reservation
      updatedAt: new Date().toISOString(),
    };
    this.data.rooms[index] = updated;
    this.saveData();
    return updated;
  }

  deleteRoom(id: string): boolean {
    const initialLen = this.data.rooms.length;
    this.data.rooms = this.data.rooms.filter(r => r.id !== id);
    if (this.data.rooms.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Bookings ---
  getBookings(): Booking[] {
    return this.data.bookings;
  }

  getBookingById(id: string): Booking | undefined {
    return this.data.bookings.find(b => b.id === id);
  }

  getBookingsByUserId(userId: string): Booking[] {
    return this.data.bookings.filter(b => b.userId === userId);
  }

  getBookedSlots(roomId: string, date: string): string[] {
    return this.data.bookings
      .filter(b => b.roomId === roomId && b.date === date && b.status !== 'cancelled')
      .map(b => b.timeSlot);
  }

  createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking {
    const now = new Date();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const id = `BK${dateCode}-${randCode}`;

    const newBooking: Booking = {
      ...bookingData,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.data.bookings.unshift(newBooking);
    this.saveData();
    return newBooking;
  }

  updateBookingStatus(id: string, status: Booking['status'], cancelReason?: string): Booking | null {
    const booking = this.data.bookings.find(b => b.id === id);
    if (!booking) return null;

    booking.status = status;
    if (cancelReason) {
      booking.cancelReason = cancelReason;
    }
    booking.updatedAt = new Date().toISOString();
    this.saveData();
    return booking;
  }

  deleteBooking(id: string): boolean {
    const initialLen = this.data.bookings.length;
    this.data.bookings = this.data.bookings.filter(b => b.id !== id);
    if (this.data.bookings.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }
}

export const db = new Database();
