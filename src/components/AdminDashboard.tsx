import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Calendar, 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Copy, 
  Check, 
  Users, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { User, Room, Booking, AdminStats } from '../types.ts';
import { api } from '../api.ts';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'stats'>('bookings');

  // Stats State
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Rooms State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomFilterCategory, setRoomFilterCategory] = useState<string>('all');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);

  // Room Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('高階會議室');
  const [formDescription, setFormDescription] = useState('');
  const [formCapacity, setFormCapacity] = useState('10');
  const [formArea, setFormArea] = useState('35 平方米');
  const [formAmenities, setFormAmenities] = useState('4K 觸控白板, 視訊會議系統, 無線投影, 高速 Wi-Fi');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80');
  const [formStatus, setFormStatus] = useState<Room['status']>('available');

  // Bookings State
  const [adminBookings, setAdminBookings] = useState<Booking[]>([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Data
  const loadStats = async () => {
    try {
      const res = await api.getAdminStats();
      setStats(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRooms = async () => {
    try {
      const res = await api.getRooms();
      setRooms(res.rooms);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await api.getAdminBookings({
        status: bookingStatusFilter === 'all' ? undefined : bookingStatusFilter,
        search: bookingSearch || undefined,
      });
      setAdminBookings(res.bookings);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadRooms(), loadBookings()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [bookingStatusFilter, bookingSearch]);

  // Handle Room Edit Open
  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormCategory(room.category);
    setFormDescription(room.description);
    setFormCapacity(String(room.capacity));
    setFormArea(room.area);
    setFormAmenities(room.amenities.join(', '));
    setFormImageUrl(room.imageUrl);
    setFormStatus(room.status);
    setIsCreatingRoom(false);
  };

  // Handle Room Create Open
  const openCreateRoom = () => {
    setEditingRoom(null);
    setFormName('');
    setFormCategory('高階會議室');
    setFormDescription('');
    setFormCapacity('10');
    setFormArea('35 平方米');
    setFormAmenities('4K 觸控白板, 視訊會議系統, 無線投影, 高速 Wi-Fi');
    setFormImageUrl('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80');
    setFormStatus('available');
    setIsCreatingRoom(true);
  };

  // Save Room (Create or Update)
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory.trim()) {
      setActionMessage({ type: 'error', text: '請填寫房型名稱與分類' });
      return;
    }

    const amenitiesList = formAmenities
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);

    try {
      if (isCreatingRoom) {
        await api.createRoom({
          name: formName,
          category: formCategory,
          description: formDescription,
          capacity: parseInt(formCapacity, 10) || 1,
          area: formArea,
          amenities: amenitiesList,
          imageUrl: formImageUrl,
          status: formStatus,
        });
        setActionMessage({ type: 'success', text: '已成功新增房型空間！' });
      } else if (editingRoom) {
        await api.updateRoom(editingRoom.id, {
          name: formName,
          category: formCategory,
          description: formDescription,
          capacity: parseInt(formCapacity, 10) || 1,
          area: formArea,
          amenities: amenitiesList,
          imageUrl: formImageUrl,
          status: formStatus,
        });
        setActionMessage({ type: 'success', text: '房型資料更新成功！' });
      }

      setIsCreatingRoom(false);
      setEditingRoom(null);
      await loadRooms();
      await loadStats();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || '儲存房型失敗' });
    }
  };

  // Delete Room
  const handleDeleteRoom = async (id: string, name: string) => {
    if (!window.confirm(`確定要刪除「${name}」房型嗎？此操作將同時移除關聯預約！`)) {
      return;
    }

    try {
      await api.deleteRoom(id);
      setActionMessage({ type: 'success', text: `已刪除「${name}」` });
      await loadRooms();
      await loadStats();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || '刪除房型失敗' });
    }
  };

  // Toggle Room Status directly
  const handleToggleRoomStatus = async (room: Room, nextStatus: Room['status']) => {
    try {
      await api.updateRoom(room.id, { status: nextStatus });
      setActionMessage({ type: 'success', text: `${room.name} 狀態已變更為：${nextStatus}` });
      await loadRooms();
      await loadStats();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || '狀態變更失敗' });
    }
  };

  // Booking Status Change (Admin)
  const handleUpdateBookingStatus = async (id: string, newStatus: Booking['status']) => {
    try {
      await api.updateAdminBooking(id, { status: newStatus });
      setActionMessage({ type: 'success', text: `預約 ${id} 狀態已更新為 ${newStatus}` });
      await loadBookings();
      await loadStats();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || '預約狀態更新失敗' });
    }
  };

  // Delete Booking (Admin)
  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm(`確定要完全刪除預約 ${id} 紀錄嗎？`)) {
      return;
    }

    try {
      await api.deleteAdminBooking(id);
      setActionMessage({ type: 'success', text: `已刪除預約 ${id}` });
      await loadBookings();
      await loadStats();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || '刪除預約失敗' });
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-purple-500/20 text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider text-purple-300 font-bold">
              Admin Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            BOOK LA 會議室管理員控制台
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            管理會議室 A 至會議室 E 上架、即時審核全免預約訂單、監控檔期與查詢資料庫結構
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshAll}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            重新載入數據
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs underline hover:opacity-80"
          >
            關閉
          </button>
        </div>
      )}

      {/* Admin KPI Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
              <span>總預約數 (全免)</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900">{stats.totalBookings}</span>
              <span className="text-xs text-emerald-600 font-bold">已確認 {stats.confirmedBookings}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
              <span>今日即時預約</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-700">{stats.todayBookings}</span>
              <span className="text-xs text-stone-400">筆排程中</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
              <span>開放中會議室</span>
              <Layers className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900">{stats.activeRooms}</span>
              <span className="text-xs text-stone-400">總計 {stats.totalRooms} 間</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
              <span>註冊會員人數</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900">{stats.totalMembers}</span>
              <span className="text-xs text-stone-400">活躍會員</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-stone-200 space-x-1 sm:space-x-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-white text-stone-900 border-t-2 border-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          預約管理總表 ({adminBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-white text-stone-900 border-t-2 border-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-600" />
          會議室管理 ({rooms.length})
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-white text-stone-900 border-t-2 border-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          預約熱門分析
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: BOOKING MANAGEMENT (預約總表) */}
      {/* ============================================================== */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Controls */}
          <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">所有用戶預約訂單總表</h2>
              <p className="text-xs text-stone-500">
                審核、更改狀態或手動取消任何預約，即時釋出檔期時段
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜尋編號、姓名、電話、房型..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-stone-400"
                />
              </div>

              {/* Status Filter */}
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">所有狀態</option>
                <option value="confirmed">已確認 (Confirmed)</option>
                <option value="pending">待審核 (Pending)</option>
                <option value="cancelled">已取消 (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">預約編號</th>
                  <th className="py-3 px-4">空間房型</th>
                  <th className="py-3 px-4">日期與時段</th>
                  <th className="py-3 px-4">預約人資訊</th>
                  <th className="py-3 px-4">人數</th>
                  <th className="py-3 px-4">狀態</th>
                  <th className="py-3 px-4 text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {adminBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400 text-xs">
                      目前沒有符合條件的預約紀錄
                    </td>
                  </tr>
                ) : (
                  adminBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                        {b.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        {b.roomName}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        <div className="font-semibold text-stone-800">{b.date}</div>
                        <div className="text-[11px] text-stone-500">{b.timeSlot}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900">{b.userName}</div>
                        <div className="text-[11px] text-stone-500">{b.userPhone}</div>
                        <div className="text-[11px] text-stone-400">{b.userEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        {b.attendeesCount} 人
                      </td>
                      <td className="py-3.5 px-4">
                        {b.status === 'confirmed' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 已確認
                          </span>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> 已取消
                          </span>
                        )}
                        {b.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> 待審核
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status !== 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition"
                              title="審核並確認此預約"
                            >
                              確認
                            </button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold transition"
                              title="取消此預約"
                            >
                              取消
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 transition"
                            title="徹底刪除紀錄"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ROOM MANAGEMENT (會議室空間管理) */}
      {/* ============================================================== */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">會議室列表 (會議室 A 至 會議室 E)</h2>
              <p className="text-xs text-stone-500">
                新增、編輯、下架或維護各類高階會議室、專案討論室與多功能視訊空間
              </p>
            </div>

            <button
              onClick={openCreateRoom}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              新增會議室
            </button>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-stone-100">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-stone-900/80 text-white text-[11px] font-semibold">
                        {room.category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <select
                        value={room.status}
                        onChange={(e) => handleToggleRoomStatus(room, e.target.value as Room['status'])}
                        className={`text-xs font-bold rounded-lg px-2 py-1 border shadow-xs ${
                          room.status === 'available'
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : room.status === 'maintenance'
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-stone-600 text-white border-stone-700'
                        }`}
                      >
                        <option value="available" className="text-stone-900 bg-white">開放預約</option>
                        <option value="maintenance" className="text-stone-900 bg-white">維護保養中</option>
                        <option value="offline" className="text-stone-900 bg-white">暫時下架</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-stone-900 text-base">{room.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span>容納：{room.capacity} 人</span>
                      <span>面積：{room.area}</span>
                      <span className="text-emerald-700 font-bold">全額免費</span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-1">
                      {room.amenities.map((a, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] text-stone-600">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">{room.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditRoom(room)}
                      className="px-3 py-1 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                      編輯
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id, room.name)}
                      className="px-3 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Room Modal (Create / Edit) */}
          {(isCreatingRoom || editingRoom) && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h3 className="text-xl font-bold text-stone-900">
                    {isCreatingRoom ? '新增會議室' : `編輯會議室：${editingRoom?.name}`}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingRoom(false);
                      setEditingRoom(null);
                    }}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveRoom} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        會議室名稱 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="例如：會議室 F"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-stone-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        空間分類 *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                      >
                        <option value="高階會議室">高階會議室</option>
                        <option value="專案會議室">專案會議室</option>
                        <option value="小組討論室">小組討論室</option>
                        <option value="視訊會議室">視訊會議室</option>
                        <option value="大型多功能室">大型多功能室</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        容納人數 (上限)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formCapacity}
                        onChange={(e) => setFormCapacity(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        空間面積
                      </label>
                      <input
                        type="text"
                        value={formArea}
                        onChange={(e) => setFormArea(e.target.value)}
                        placeholder="例如：28 平方米"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        狀態設定
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as Room['status'])}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                      >
                        <option value="available">開放預約</option>
                        <option value="maintenance">維護中</option>
                        <option value="offline">下架</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      圖片 URL 網址
                    </label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      設備清單 (以逗號分隔)
                    </label>
                    <input
                      type="text"
                      value={formAmenities}
                      onChange={(e) => setFormAmenities(e.target.value)}
                      placeholder="放大機, 沖洗槽, 紅光燈, 抽氣排風, 4K螢幕"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      房型詳細描述
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="詳細說明該空間的特色、適合對象與設施規畫..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingRoom(false);
                        setEditingRoom(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition"
                    >
                      儲存房型
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: STATS ANALYTICS (熱門統計) */}
      {/* ============================================================== */}
      {activeTab === 'stats' && stats && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">各會議室預約次數排行榜</h2>
            <p className="text-xs text-stone-500">
              即時統計各會議室之有效預約總數與利用分佈
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(stats.roomBookingCounts).length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">暫無預約統計紀錄</p>
            ) : (
              Object.entries(stats.roomBookingCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([roomName, count], idx) => {
                  const maxCount = Math.max(...Object.values(stats.roomBookingCounts), 1);
                  const percentage = Math.round((count / maxCount) * 100);

                  return (
                    <div key={roomName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          {roomName}
                        </span>
                        <span className="font-bold text-emerald-700">{count} 次預約</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
