import React from 'react';
import { Users, Maximize2, CalendarPlus, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Room } from '../types.ts';

interface RoomCardProps {
  room: Room;
  onSelectBooking: (room: Room) => void;
  onViewDetails: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onSelectBooking,
  onViewDetails,
}) => {
  const isAvailable = room.status === 'available';

  return (
    <div className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-stone-300 transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-stone-100">
        <img
          src={room.imageUrl}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-medium">
            {room.category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {room.status === 'available' && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> 開放預約
            </span>
          )}
          {room.status === 'maintenance' && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/95 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1 shadow-xs">
              <AlertCircle className="w-3.5 h-3.5" /> 維護保養中
            </span>
          )}
          {room.status === 'offline' && (
            <span className="px-2.5 py-1 rounded-full bg-stone-500/90 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
              暫停開放
            </span>
          )}
        </div>

        {/* Free Tag Pill in Bottom Corner */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300/80 text-xs font-bold shadow-xs">
            預約全免費 $0
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Title */}
          <h3 
            onClick={() => onViewDetails(room)} 
            className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition cursor-pointer line-clamp-1"
          >
            {room.name}
          </h3>

          {/* Specs */}
          <div className="mt-2 flex items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              容納 {room.capacity} 人
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
              {room.area}
            </span>
          </div>

          {/* Description */}
          <p className="mt-3 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {room.description}
          </p>

          {/* Amenities Badges */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-stone-50 text-stone-400 text-[11px]">
                +{room.amenities.length - 3} 設備
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2">
          <button
            onClick={() => onViewDetails(room)}
            className="flex-1 py-2 px-3 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1"
          >
            <Info className="w-4 h-4 text-stone-500" />
            查看詳情
          </button>

          <button
            disabled={!isAvailable}
            onClick={() => onSelectBooking(room)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-xs ${
              isAvailable
                ? 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer active:scale-98'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
            }`}
          >
            <CalendarPlus className="w-4 h-4" />
            {isAvailable ? '立即預訂' : '暫不開放'}
          </button>
        </div>
      </div>
    </div>
  );
};
