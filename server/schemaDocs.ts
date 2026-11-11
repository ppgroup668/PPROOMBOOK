export const SCHEMA_DOCS = {
  title: 'BookJor 空間預約系統 — 資料庫 Schema 設計與部屬規範',
  description: '此規格提供 SQLite 關聯式資料庫結構、MongoDB Mongoose 結構、以及 Node.js Express 串接與部屬手冊。',
  sqliteDDL: `
-- ==========================================
-- 1. SQLite 結構設計 (DDL)
-- ==========================================

-- 使用者資料表 (會員與管理員)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'member')) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 空間 / 房型 / 暗室資料表 (預約全免費，price 固定為 0)
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL DEFAULT 1,
    area TEXT,
    amenities TEXT, -- JSON 陣列，例如 '["放大機", "紅光燈", "水槽"]'
    price INTEGER DEFAULT 0, -- 全免費
    image_url TEXT,
    status TEXT CHECK(status IN ('available', 'maintenance', 'offline')) DEFAULT 'available',
    available_time_slots TEXT, -- JSON 陣列，例如 '["09:00-11:00", "14:00-16:00"]'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 預約訂單資料表
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY, -- 格式如 BK20261110-8021
    room_id TEXT NOT NULL,
    room_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    attendees_count INTEGER DEFAULT 1,
    notes TEXT,
    status TEXT CHECK(status IN ('confirmed', 'pending', 'cancelled', 'completed')) DEFAULT 'confirmed',
    cancel_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 建立日期與房間複合索引，加速可用時段查詢
CREATE INDEX IF NOT EXISTS idx_bookings_room_date ON bookings(room_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
`.trim(),

  mongoSchema: `
// ==========================================
// 2. MongoDB (Mongoose) 結構設計與串接範例
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

// --- User Schema ---
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'admin' | 'member';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  createdAt: { type: Date, default: Date.now },
});

// --- Room Schema ---
export interface IRoom extends Document {
  name: string;
  category: string;
  description: string;
  capacity: number;
  area: string;
  amenities: string[];
  price: number; // 0 (全額免費)
  imageUrl: string;
  status: 'available' | 'maintenance' | 'offline';
  availableTimeSlots: string[];
}

const RoomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  capacity: { type: Number, required: true, default: 1 },
  area: { type: String },
  amenities: [{ type: String }],
  price: { type: Number, default: 0 },
  imageUrl: { type: String },
  status: { type: String, enum: ['available', 'maintenance', 'offline'], default: 'available' },
  availableTimeSlots: [{ type: String }],
}, { timestamps: true });

// --- Booking Schema ---
export interface IBooking extends Document {
  id: string; // 自訂預約編號
  room: mongoose.Types.ObjectId | IRoom;
  roomName: string;
  user: mongoose.Types.ObjectId | IUser;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  attendeesCount: number;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  cancelReason?: string;
}

const BookingSchema = new Schema<IBooking>({
  id: { type: String, required: true, unique: true },
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  roomName: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, required: true },
  date: { type: String, required: true, index: true },
  timeSlot: { type: String, required: true },
  attendeesCount: { type: Number, default: 1 },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['confirmed', 'pending', 'cancelled', 'completed'], 
    default: 'confirmed',
    index: true 
  },
  cancelReason: { type: String }
}, { timestamps: true });

// 複合唯一或檢索索引：防重複預訂
BookingSchema.index({ room: 1, date: 1, timeSlot: 1, status: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
export const Room = mongoose.model<IRoom>('Room', RoomSchema);
export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
`.trim(),

  deploymentGuide: `
==========================================
3. 系統啟動與部屬手冊
==========================================

【本地開發環境啟動】
1. 下載或 Clone 專案至本機伺服器
2. 安裝相依套件：
   $ npm install
3. 建立環境變數檔案 (.env)：
   PORT=3000
   JWT_SECRET="your_secure_jwt_secret_key"
   NODE_ENV="development"
4. 啟動全端伺服器 (包含 Express API 與前端 Vite)：
   $ npm run dev
5. 開啟瀏覽器訪問：http://localhost:3000

【生產環境部屬 (Production)】
1. 建置前端資產：
   $ npm run build
2. 使用 PM2 或 Docker 守護 Node.js 程序：
   $ npm start
   或使用 PM2:
   $ pm2 start "npm start" --name "bookjor-app"

【預設系統帳號】
- 管理員帳號 (Admin)：
  帳號：admin@bookjor.com
  密碼：admin123
  權限：房型新增/編輯/下架、預約全表審核與手動調度
- 一般會員帳號 (Member)：
  帳號：user@example.com
  密碼：user123
  權限：前台預約、查看個人預約紀錄、線上取消
`.trim()
};
