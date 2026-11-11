import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { db, User, Room, Booking } from './server/db.ts';
import { SCHEMA_DOCS } from './server/schemaDocs.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'bookjor_jwt_secret_token_2026';

app.use(express.json());

// Extend Request type for Auth
interface AuthRequest extends Request {
  user?: User;
}

// Auth Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '請先登入帳號以進行此操作' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err || !decoded) {
      return res.status(403).json({ error: '登入憑證無效或已過期，請重新登入' });
    }
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: '找不到該用戶帳號' });
    }
    req.user = user;
    next();
  });
}

// Optional Auth (for bookings where guest or member may book)
function optionalAuthenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (!err && decoded) {
      const user = db.getUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  });
}

// Admin only Middleware
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '權限不足：此功能僅限系統管理員操作' });
  }
  next();
}

function sanitizeUser(user: User) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

// ==========================================
// 1. Authentication Routes
// ==========================================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: '請填寫所有必填欄位 (姓名、電子郵件、電話、密碼)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密碼長度需至少為 6 個字元' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: '此電子郵件已被註冊，請直接登入' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = db.createUser({
      name,
      email,
      phone,
      passwordHash,
      role: 'member',
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: '註冊成功！歡迎使用 BOOK LA 會議室預約系統',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: '伺服器內部錯誤，請稍後再試' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '請輸入電子郵件與密碼' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: '電子郵件或密碼錯誤' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: '電子郵件或密碼錯誤' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: '登入成功',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: '伺服器內部錯誤，請稍後再試' });
  }
});

// Current User Profile
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({ user: sanitizeUser(req.user!) });
});

// ==========================================
// 2. Room Routes (房型與空間)
// ==========================================

// Get Rooms (Public)
app.get('/api/rooms', (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;
    let rooms = db.getRooms();

    if (category && typeof category === 'string' && category !== 'all') {
      rooms = rooms.filter(r => r.category === category);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      rooms = rooms.filter(r => r.status === status);
    }

    return res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    return res.status(500).json({ error: '無法讀取房型資料' });
  }
});

// Get Single Room
app.get('/api/rooms/:id', (req: Request, res: Response) => {
  const room = db.getRoomById(req.params.id);
  if (!room) {
    return res.status(404).json({ error: '找不到該房型空間' });
  }
  return res.json({ room });
});

// Create Room (Admin only)
app.post('/api/rooms', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description, capacity, area, amenities, imageUrl, status, availableTimeSlots } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: '請填寫房型名稱與分類' });
    }

    const defaultSlots = [
      '09:00 - 11:00',
      '11:00 - 13:00',
      '14:00 - 16:00',
      '16:00 - 18:00',
      '19:00 - 21:00'
    ];

    const newRoom = db.createRoom({
      name,
      category,
      description: description || '',
      capacity: parseInt(capacity, 10) || 1,
      area: area || '20 平方米',
      amenities: Array.isArray(amenities) ? amenities : [],
      price: 0, // 全免費
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80',
      status: status || 'available',
      availableTimeSlots: Array.isArray(availableTimeSlots) && availableTimeSlots.length ? availableTimeSlots : defaultSlots,
    });

    return res.status(201).json({ message: '成功新增房型空間', room: newRoom });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ error: '新增房型失敗' });
  }
});

// Update Room (Admin only)
app.put('/api/rooms/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const updated = db.updateRoom(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: '找不到該房型' });
    }
    return res.json({ message: '房型已成功更新', room: updated });
  } catch (error) {
    console.error('Update room error:', error);
    return res.status(500).json({ error: '更新房型失敗' });
  }
});

// Delete Room (Admin only)
app.delete('/api/rooms/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteRoom(req.params.id);
  if (!success) {
    return res.status(404).json({ error: '找不到欲刪除的房型' });
  }
  return res.json({ message: '已成功刪除該房型' });
});

// ==========================================
// 3. Booking Routes (預約管理)
// ==========================================

// Check Availability for Room and Date
app.get('/api/bookings/availability', (req: Request, res: Response) => {
  const { roomId, date } = req.query;
  if (!roomId || !date || typeof roomId !== 'string' || typeof date !== 'string') {
    return res.status(400).json({ error: '請提供房型 ID (roomId) 與預約日期 (date)' });
  }

  const room = db.getRoomById(roomId);
  if (!room) {
    return res.status(404).json({ error: '找不到指定的空間房型' });
  }

  const bookedSlots = db.getBookedSlots(roomId, date);
  const slotsStatus = room.availableTimeSlots.map(slot => ({
    slot,
    available: !bookedSlots.includes(slot),
  }));

  return res.json({
    roomId,
    date,
    slots: slotsStatus,
  });
});

// Member's Own Bookings
app.get('/api/bookings/my', authenticateToken, (req: AuthRequest, res: Response) => {
  const bookings = db.getBookingsByUserId(req.user!.id);
  return res.json({ bookings });
});

// Create a Booking (Free reservation)
app.post('/api/bookings', optionalAuthenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { roomId, date, timeSlot, userName, userEmail, userPhone, attendeesCount, notes } = req.body;

    if (!roomId || !date || !timeSlot) {
      return res.status(400).json({ error: '請選擇房型、日期與預約時段' });
    }

    const room = db.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ error: '找不到指定的房型空間' });
    }

    if (room.status !== 'available') {
      return res.status(400).json({ error: '該空間目前未開放預約（維護中或已下架）' });
    }

    // Check conflict
    const bookedSlots = db.getBookedSlots(roomId, date);
    if (bookedSlots.includes(timeSlot)) {
      return res.status(409).json({ error: '很抱歉，該時段已被其他用戶預訂，請選擇其他時段或日期' });
    }

    // Identify user
    const finalUserId = req.user ? req.user.id : `guest_${Date.now()}`;
    const finalName = req.user ? req.user.name : (userName || '訪客預約');
    const finalEmail = req.user ? req.user.email : (userEmail || 'guest@example.com');
    const finalPhone = req.user ? req.user.phone : (userPhone || '0900-000-000');

    if (!finalName || !finalEmail || !finalPhone) {
      return res.status(400).json({ error: '請填寫預約聯絡人姓名、電子郵件與電話' });
    }

    const newBooking = db.createBooking({
      roomId: room.id,
      roomName: room.name,
      userId: finalUserId,
      userName: finalName,
      userEmail: finalEmail,
      userPhone: finalPhone,
      date,
      timeSlot,
      attendeesCount: attendeesCount ? Math.min(parseInt(attendeesCount, 10), room.capacity) : 1,
      notes: notes || '',
      status: 'confirmed', // Auto-confirmed for modern zero-friction free reservation
    });

    return res.status(201).json({
      message: '預約成功！全額免費，已為您保留專屬空間。',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ error: '預約建立失敗，請稍後再試' });
  }
});

// Cancel a Booking (User or Admin)
app.post('/api/bookings/:id/cancel', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const booking = db.getBookingById(id);
  if (!booking) {
    return res.status(404).json({ error: '找不到該預約紀錄' });
  }

  // Permission check: must be owner or admin
  if (booking.userId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: '您無權取消非本人的預約' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: '此預約先前已取消' });
  }

  // Check if date is in the past
  const bookingDate = new Date(booking.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today && req.user!.role !== 'admin') {
    return res.status(400).json({ error: '過去的預約紀錄無法在線上取消' });
  }

  const updated = db.updateBookingStatus(id, 'cancelled', reason || '用戶自主線上取消');
  return res.json({ message: '預約已成功取消', booking: updated });
});

// ==========================================
// 4. Admin Management Routes (管理員專區)
// ==========================================

// Get All Bookings (Admin)
app.get('/api/admin/bookings', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    let bookings = db.getBookings();

    if (status && typeof status === 'string' && status !== 'all') {
      bookings = bookings.filter(b => b.status === status);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase();
      bookings = bookings.filter(b =>
        b.id.toLowerCase().includes(q) ||
        b.roomName.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.userEmail.toLowerCase().includes(q) ||
        b.userPhone.includes(q)
      );
    }

    return res.json({ bookings });
  } catch (error) {
    console.error('Admin get bookings error:', error);
    return res.status(500).json({ error: '無法讀取預約總表' });
  }
});

// Update Booking Status or Details (Admin)
app.put('/api/admin/bookings/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, cancelReason } = req.body;

  if (!status) {
    return res.status(400).json({ error: '請提供欲更新的狀態' });
  }

  const updated = db.updateBookingStatus(id, status, cancelReason);
  if (!updated) {
    return res.status(404).json({ error: '找不到該預約' });
  }

  return res.json({ message: '預約狀態更新成功', booking: updated });
});

// Delete Booking (Admin)
app.delete('/api/admin/bookings/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const success = db.deleteBooking(id);
  if (!success) {
    return res.status(404).json({ error: '找不到該預約' });
  }
  return res.json({ message: '預約紀錄已完全刪除' });
});

// Admin Dashboard Overview Statistics
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const rooms = db.getRooms();
    const bookings = db.getBookings();
    const users = db.getUsers();

    const todayStr = new Date().toISOString().split('T')[0];

    const totalRooms = rooms.length;
    const activeRooms = rooms.filter(r => r.status === 'available').length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled').length;
    const totalMembers = users.filter(u => u.role === 'member').length;

    // Room utilization stats
    const roomBookingCounts: Record<string, number> = {};
    bookings.forEach(b => {
      if (b.status !== 'cancelled') {
        roomBookingCounts[b.roomName] = (roomBookingCounts[b.roomName] || 0) + 1;
      }
    });

    return res.json({
      totalRooms,
      activeRooms,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      todayBookings,
      totalMembers,
      roomBookingCounts,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: '無法讀取統計數據' });
  }
});

// ==========================================
// 5. System Schema Documentation Route
// ==========================================
app.get('/api/system/schema-docs', (_req: Request, res: Response) => {
  return res.json(SCHEMA_DOCS);
});

// ==========================================
// 6. Vite Integration / Static Assets
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev mode, mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> BOOK LA 會議室預約系統全端伺服器運行於: http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
