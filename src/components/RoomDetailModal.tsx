import React from 'react';
import { X, Users, Maximize2, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, CalendarPlus } from 'lucide-react';
import { Room } from '../types.ts';

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onBookRoom: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onBookRoom,
}) => {
  if (!room) return null;

  const isAvailable = room.status === 'available';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
        {/* Modal Header Image */}
        <div className="relative h-64 sm:h-72 w-full bg-stone-100 shrink-0">
          <img
            src={room.imageUrl}
            alt={room.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/60 text-white hover:bg-stone-900/90 transition backdrop-blur-xs cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-semibold">
              {room.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> 全免費 $0
            </span>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-stone-900">{room.name}</h2>
              {isAvailable ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 開放預約
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> 維護暫停
                </span>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-stone-600 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>容納上限：<strong className="text-stone-900">{room.capacity} 人</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-blue-600" />
                <span>空間面積：<strong className="text-stone-900">{room.area}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>預約費用：<strong className="text-emerald-700">完全免費 (NT$ 0)</strong></span>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-2">空間簡介與特色</h4>
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {room.description}
            </p>
          </div>

          {/* Amenities & Equipment */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-3">配備與專業器材</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {room.amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-medium text-stone-700 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Policies */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              使用須知與預約守則
            </div>
            <p>1. 預約時段全免費開放，請珍惜公共資源，若臨時無法前往，請於前 2 小時至會員中心取消。</p>
            <p>2. 會議室內提供專業投影與視訊設備，使用完畢請將訊號線歸位並保持白板與桌面清潔。</p>
            <p>3. 離場前請隨手關閉投影片電源、空調及照明設備，共同維護優質商務協作環境。</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-stone-500">
            支援線上自動審核確認
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-semibold transition"
            >
              關閉
            </button>
            <button
              disabled={!isAvailable}
              onClick={() => {
                onClose();
                onBookRoom(room);
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 ${
                isAvailable
                  ? 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer active:scale-98'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <CalendarPlus className="w-4 h-4 text-emerald-400" />
              {isAvailable ? '前往挑選時段預約' : '暫停預約'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
