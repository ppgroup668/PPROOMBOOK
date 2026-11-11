import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar, 
  User as UserIcon, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  CalendarDays,
  FileText
} from 'lucide-react';
import { Room, User, Booking, SlotAvailability } from '../types.ts';
import { api } from '../api.ts';

interface BookingModalProps {
  room: Room | null;
  currentUser: User | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onViewMyBookings: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  currentUser,
  onClose,
  onBookingSuccess,
  onViewMyBookings,
}) => {
  if (!room) return null;

  // Multi-step: 1: Date & Time, 2: Info & Confirm, 3: Completed Success Voucher
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const [slotsAvailability, setSlotsAvailability] = useState<SlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Booking Form State
  const [userName, setUserName] = useState<string>(currentUser?.name || '');
  const [userEmail, setUserEmail] = useState<string>(currentUser?.email || '');
  const [userPhone, setUserPhone] = useState<string>(currentUser?.phone || '');
  const [attendeesCount, setAttendeesCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Sync user if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (!userName) setUserName(currentUser.name);
      if (!userEmail) setUserEmail(currentUser.email);
      if (!userPhone) setUserPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Fetch slots whenever selectedDate or room changes
  useEffect(() => {
    if (!room || !selectedDate) return;

    let isMounted = true;
    setLoadingSlots(true);
    setSelectedSlot('');
    setErrorMessage('');

    api.checkAvailability(room.id, selectedDate)
      .then((res) => {
        if (isMounted) {
          setSlotsAvailability(res.slots);
          // auto-select first available slot if any
          const firstAvailable = res.slots.find(s => s.available);
          if (firstAvailable) {
            setSelectedSlot(firstAvailable.slot);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setErrorMessage('時段讀取失敗，請重新選擇日期');
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [room, selectedDate]);

  // Calendar navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  const daysGrid: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    daysGrid.push(`${year}-${mm}-${dd}`);
  }

  // Handle Submit Booking
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('請挑選預約時段');
      return;
    }
    if (!userName.trim() || !userEmail.trim() || !userPhone.trim()) {
      setErrorMessage('請完整填寫姓名、電子郵件與電話');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.createBooking({
        roomId: room.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        userName,
        userEmail,
        userPhone,
        attendeesCount,
        notes,
      });

      setConfirmedBooking(res.booking);
      setStep(3);
      onBookingSuccess(res.booking);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if canvas-confetti is not supported
      }
    } catch (err: any) {
      setErrorMessage(err.message || '預約失敗，該時段可能剛剛被搶訂');
    } finally {
      setSubmitting(false);
    }
  };

  const copyBookingId = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/60 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                $0 全額免費
              </span>
              <span className="text-xs text-stone-500 font-medium">{room.category}</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">{room.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Interactive Calendar & Slot Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  步驟 1：挑選預訂日期
                </label>

                {/* Calendar Card */}
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
                  {/* Calendar Month Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-stone-800">
                      {year} 年 {month + 1} 月
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 transition"
                        title="上個月"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 transition"
                        title="下個月"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400 mb-2">
                    <div>日</div>
                    <div>一</div>
                    <div>二</div>
                    <div>三</div>
                    <div>四</div>
                    <div>五</div>
                    <div>六</div>
                  </div>

                  {/* Day Cells */}
                  <div className="grid grid-cols-7 gap-1">
                    {daysGrid.map((dateStr, idx) => {
                      if (!dateStr) {
                        return <div key={`empty-${idx}`} className="h-9" />;
                      }

                      const isPast = dateStr < todayStr;
                      const isSelected = dateStr === selectedDate;
                      const isToday = dateStr === todayStr;
                      const dayNumber = parseInt(dateStr.split('-')[2], 10);

                      return (
                        <button
                          key={dateStr}
                          disabled={isPast}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition relative ${
                            isSelected
                              ? 'bg-stone-900 text-white shadow-xs font-bold scale-105 z-10'
                              : isPast
                              ? 'text-stone-300 cursor-not-allowed'
                              : 'text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                          } ${isToday && !isSelected ? 'border border-emerald-500 font-bold text-emerald-700' : ''}`}
                        >
                          {dayNumber}
                          {isToday && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Slots Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    步驟 2：選擇預約時段 (預約日期：{selectedDate})
                  </label>
                  <span className="text-xs text-stone-500">
                    時段長度：2 小時 / 段
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-8 text-center text-stone-400 text-sm">
                    載入檔期可用性中...
                  </div>
                ) : slotsAvailability.length === 0 ? (
                  <div className="py-6 text-center text-stone-500 text-xs">
                    目前此日期暫無開放時段
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {slotsAvailability.map((slotItem) => {
                      const isSelected = selectedSlot === slotItem.slot;
                      return (
                        <button
                          key={slotItem.slot}
                          disabled={!slotItem.available}
                          onClick={() => setSelectedSlot(slotItem.slot)}
                          className={`p-3 rounded-2xl border text-xs font-semibold transition text-left flex flex-col justify-between h-20 ${
                            !slotItem.available
                              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/30'
                              : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                          }`}
                        >
                          <span className="text-sm font-bold">{slotItem.slot}</span>
                          <span className="text-[11px] flex items-center gap-1 font-medium">
                            {slotItem.available ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                尚有空額 (免費)
                              </span>
                            ) : (
                              <span className="text-stone-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                                已被預訂
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Contact Information & Notes */}
          {step === 2 && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
                <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  您所選定的預訂空間與檔期：
                </p>
                <p className="text-stone-700 font-semibold">{room.name}</p>
                <p className="text-stone-600">
                  預約日期：<strong className="text-stone-900">{selectedDate}</strong> ｜ 時段：<strong className="text-stone-900">{selectedSlot}</strong>
                </p>
                <p className="text-emerald-700 font-bold">預約應付金額：NT$ 0 元 (全額免費推廣專案)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-stone-400" /> 預約人姓名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="例如：陳大明"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400" /> 聯絡電話 / 手機 *
                  </label>
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="例如：0912-345-678"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" /> 電子郵件 *
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="例如：name@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    入場人數 (容納上限 {room.capacity} 人)
                  </label>
                  <select
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} 位訪客
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-stone-400" /> 預約用途與特殊需求備註 (選填)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例如：需借用 Beseler 45M 放大機沖印黑白底片、需投影簡報..."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}
            </form>
          )}

          {/* STEP 3: Completed Success Screen */}
          {step === 3 && confirmedBooking && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-stone-900">預約成功！</h3>
                <p className="text-sm text-stone-600 mt-1">
                  您的專屬空間已完成保留，全額免費無需付費。
                </p>
              </div>

              {/* Voucher Card */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <span className="text-[11px] text-stone-500 block">預約編號 (Booking ID)</span>
                    <span className="text-sm font-mono font-bold text-stone-900">{confirmedBooking.id}</span>
                  </div>
                  <button
                    onClick={copyBookingId}
                    className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white hover:bg-stone-100 transition flex items-center gap-1 text-stone-700"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId ? '已複製' : '複製'}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-500">預約空間：</span>
                    <span className="font-semibold">{confirmedBooking.roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">預約日期：</span>
                    <span className="font-semibold">{confirmedBooking.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">預約時段：</span>
                    <span className="font-semibold">{confirmedBooking.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">預約聯絡人：</span>
                    <span>{confirmedBooking.userName} ({confirmedBooking.userPhone})</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-200">
                    <span className="text-stone-500">費用明細：</span>
                    <span className="font-bold text-emerald-700">NT$ 0 (全免)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between gap-3 shrink-0">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-semibold transition"
              >
                取消
              </button>
              <button
                disabled={!selectedSlot}
                onClick={() => setStep(2)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 ${
                  selectedSlot
                    ? 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer active:scale-98'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                下一步：填寫聯絡資料
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-semibold transition"
              >
                返回修改檔期
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmitBooking}
                className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition flex items-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {submitting ? '提交預約中...' : '確認完成預約 (NT$ 0 免費)'}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-semibold transition"
              >
                回到首頁
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onClose();
                    onViewMyBookings();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  <CalendarDays className="w-4 h-4 text-emerald-400" />
                  檢視我的預約紀錄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
