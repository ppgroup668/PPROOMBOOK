import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  Copy, 
  Check, 
  Search,
  Sparkles
} from 'lucide-react';
import { User, Booking } from '../types.ts';
import { api } from '../api.ts';

interface MemberDashboardProps {
  currentUser: User;
  onExploreRooms: () => void;
  onOpenBookingForRoom?: (roomId: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  currentUser,
  onExploreRooms,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getMyBookings();
      setBookings(res.bookings);
    } catch (err: any) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: err.message || '讀取預約紀錄失敗' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;

    setCancelling(true);
    try {
      await api.cancelBooking(cancellingBookingId, cancelReason || '會員個人行程更動取消');
      setFeedbackMessage({ type: 'success', text: '預約已成功取消' });
      setCancellingBookingId(null);
      setCancelReason('');
      await loadBookings();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || '取消失敗' });
    } finally {
      setCancelling(false);
    }
  };

  const copyBookingId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || 
      b.id.toLowerCase().includes(q) || 
      b.roomName.toLowerCase().includes(q) ||
      b.date.includes(q);
    return matchesFilter && matchesQuery;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl shadow-xs">
            {currentUser.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900">{currentUser.name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                一般會員
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                {currentUser.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                {currentUser.phone}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onExploreRooms}
          className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          預訂新空間 (全免)
        </button>
      </div>

      {feedbackMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs underline hover:opacity-80"
          >
            關閉
          </button>
        </div>
      )}

      {/* Bookings Section */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Header & Controls */}
        <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              我的歷史預約紀錄
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              檢視所有空間房型預約狀態，支援尚未到期預約之線上自主取消
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋預約編號或房型..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-stone-400"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg transition font-medium ${
                  filterStatus === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                全部 ({bookings.length})
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-3 py-1 rounded-lg transition font-medium ${
                  filterStatus === 'confirmed' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                已確認 ({bookings.filter(b => b.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setFilterStatus('cancelled')}
                className={`px-3 py-1 rounded-lg transition font-medium ${
                  filterStatus === 'cancelled' ? 'bg-white text-rose-800 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                已取消 ({bookings.filter(b => b.status === 'cancelled').length})
              </button>
            </div>
          </div>
        </div>

        {/* Content Table or Cards */}
        {loading ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            載入預約紀錄中...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700">目前尚無相符的預約紀錄</p>
              <p className="text-xs text-stone-500 mt-1">
                您可以隨時挑選合適的會議室，享受全免費預約服務。
              </p>
            </div>
            <button
              onClick={onExploreRooms}
              className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition"
            >
              立刻瀏覽開放空間
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredBookings.map((booking) => {
              const isPast = booking.date < todayStr;
              const canCancel = booking.status === 'confirmed' && !isPast;

              return (
                <div
                  key={booking.id}
                  className="p-5 sm:p-6 hover:bg-stone-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200 flex items-center gap-1.5">
                        {booking.id}
                        <button
                          onClick={() => copyBookingId(booking.id)}
                          title="複製預約編號"
                          className="text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {copiedId === booking.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </span>

                      {booking.status === 'confirmed' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          已確認
                        </span>
                      )}

                      {booking.status === 'cancelled' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          已取消
                        </span>
                      )}

                      {booking.status === 'pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          待審核
                        </span>
                      )}

                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        NT$ 0 免費
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900">
                      {booking.roomName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <span className="flex items-center gap-1 font-semibold text-stone-800">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        日期：{booking.date}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-stone-800">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        時段：{booking.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                        人數：{booking.attendeesCount} 位
                      </span>
                    </div>

                    {booking.notes && (
                      <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                        備註需求：{booking.notes}
                      </p>
                    )}

                    {booking.cancelReason && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200/60">
                        取消原因：{booking.cancelReason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {canCancel ? (
                      <button
                        onClick={() => setCancellingBookingId(booking.id)}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                      >
                        取消預約
                      </button>
                    ) : booking.status === 'confirmed' && isPast ? (
                      <span className="text-xs text-stone-400">已過期歷史紀錄</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">確認取消此項預約？</h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              取消後該時段將立即釋出供其他創作者預訂。若未來需要使用，可隨時再前往首頁重新預約。
            </p>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                取消原因說明 (選填)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="例如：行程異動、臨時有會議..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-stone-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={cancelling}
                onClick={() => {
                  setCancellingBookingId(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
              >
                保留預約
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {cancelling ? '取消處理中...' : '確認取消預約'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
