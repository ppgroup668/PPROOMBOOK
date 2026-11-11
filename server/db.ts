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
      email: 'admin@bookjor.com',
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
      id: 'rm_darkroom_01',
      name: '銀鹽日光．專業攝影暗室 (A室)',
      category: '暗室沖印',
      description: '配備全套經典黑白及彩色沖印放大機、恆溫沖洗水槽、紅光安全燈與專用抽氣排風設備。適合底片攝影愛好者、手工印相創作及專業暗房教學。',
      capacity: 4,
      area: '28 平方米 (約 8.5 坪)',
      amenities: ['Leica/Beseler 放大機', '專用恆溫冷熱水槽', '防霧紅光安全燈', '獨立靜音排風抽氣', '無塵防靜電調製台', '底片烘乾箱'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rm_darkroom_02',
      name: '微光手工沖印與打樣暗房 (B室)',
      category: '暗室沖印',
      description: '專為個人小型沖印與中片幅/大片幅底片打樣設計的靜音暗房，備有精密藥水調溫器、烘乾設備與高精度計時器。',
      capacity: 2,
      area: '18 平方米 (約 5.5 坪)',
      amenities: ['4x5 大片幅沖片罐', '恆溫水浴加熱槽', '專業倒數計時器', '高流明檢視燈箱', '緊急洗眼器'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rm_meeting_01',
      name: '雲石多功能決策會議室 (Boardroom)',
      category: '專業會議室',
      description: '大氣沉穩的現代企業會議空間，配備 85 吋 4K 智慧觸控白板、Bose 陣列視訊麥克風、人體工學皮椅與高速光纖 Wi-Fi 6，滿足高端商務與跨國視訊洽談。',
      capacity: 12,
      area: '45 平方米 (約 14 坪)',
      amenities: ['85 吋 4K 觸控電子白板', '4K 廣角視訊追蹤鏡頭', '無線投影傳輸器', '高速 Wi-Fi 6', 'Nespresso 膠囊咖啡', '獨立隔音門窗'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rm_podcast_01',
      name: '聲學沉浸式 Podcast / 廣播直播間',
      category: '音訊與直播',
      description: '專業級聲學吸音擴散壁板裝潢，四人對談圓桌，配備 Shure SM7B 廣播動圈麥克風、RØDECaster Pro II 調音台及多視角 4K 直播相機。',
      capacity: 4,
      area: '22 平方米 (約 7 坪)',
      amenities: ['Shure SM7B 廣播麥克風 x4', 'RØDECaster Pro II 音訊控制台', '專業懸臂吊架與防噴罩', 'SONY 4K 廣角直播機', '環形柔光燈與氛圍 RGB', '超靜音獨立冷氣'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rm_focus_01',
      name: '靜思獨立專注創作室 (Focus Pod)',
      category: '獨立工作室',
      description: '隱密寧靜的個人創作與高專注工作艙，配備升降桌、Herman Miller 辦公椅、雙螢幕支架與全遮光隔音簾。',
      capacity: 1,
      area: '12 平方米 (約 3.6 坪)',
      amenities: ['電動升降辦公桌', '人體工學工藝椅', 'BenQ 護眼雙螢幕', 'Type-C 萬用擴充基座', '降噪白噪音音響', '冷熱飲用水機'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
      status: 'available',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rm_event_01',
      name: '日光天台沙龍活動廳 (Salon Hall)',
      category: '多功能展演',
      description: '挑高4米開揚玻璃採光設計，可彈性自由排列桌椅，適合舉辦小型工作坊、讀書會、藝術展覽、新書發表會與社群聚會。',
      capacity: 30,
      area: '90 平方米 (約 27 坪)',
      amenities: ['150 吋電動投影布幕', 'Epson 高流明雷射投影機', 'JBL 無線手持麥克風 x4', '模組化活動桌椅 30 組', '專屬茶水吧檯與冰箱', '戶外景觀休憩陽台'],
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
      status: 'maintenance',
      availableTimeSlots: standardSlots,
      createdAt: now,
      updatedAt: now,
    }
  ];

  const bookings: Booking[] = [
    {
      id: 'BK20261110-8021',
      roomId: 'rm_darkroom_01',
      roomName: '銀鹽日光．專業攝影暗室 (A室)',
      userId: 'usr_member1',
      userName: '陳小華 (Member)',
      userEmail: 'user@example.com',
      userPhone: '0988-765-432',
      date: todayStr,
      timeSlot: '14:00 - 16:00',
      attendeesCount: 2,
      notes: '需要借用黑白 120 沖片罐與放大機打樣。',
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'BK20261111-9314',
      roomId: 'rm_meeting_01',
      roomName: '雲石多功能決策會議室 (Boardroom)',
      userId: 'usr_member1',
      userName: '陳小華 (Member)',
      userEmail: 'user@example.com',
      userPhone: '0988-765-432',
      date: tomorrowStr,
      timeSlot: '09:00 - 11:00',
      attendeesCount: 8,
      notes: '公司季度跨部門戰略評估會議，需準備無線投影。',
      status: 'confirmed',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'BK20261113-1045',
      roomId: 'rm_podcast_01',
      roomName: '聲學沉浸式 Podcast / 廣播直播間',
      userId: 'usr_member2',
      userName: '林美玲',
      userEmail: 'meiling@example.com',
      userPhone: '0922-111-222',
      date: in3DaysStr,
      timeSlot: '16:00 - 18:00',
      attendeesCount: 3,
      notes: '錄製專訪節目第12集，自備筆電。',
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
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
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
