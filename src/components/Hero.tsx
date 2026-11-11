import React from 'react';
import { Sparkles, Shield, Clock, CalendarCheck, Search } from 'lucide-react';

interface HeroProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onScrollToRooms: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onScrollToRooms,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-100 via-stone-50 to-white pt-12 pb-16 border-b border-stone-200">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
        <div className="absolute top-12 left-1/4 w-72 h-72 bg-emerald-200/50 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
          全站空間預約 100% 全免費體驗．即時確認檔期
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 max-w-4xl mx-auto leading-[1.15]">
          為創意與專注打造的 <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-emerald-800 to-stone-700">
            極致空間預約平台
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          精選專業黑白暗室、會議室、Podcast 錄音間與個人專注工作艙。
          靈活挑選日期時段，無需手續費與押金，隨享頂級創作與商務體驗。
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-10 max-w-3xl mx-auto bg-white p-3 rounded-2xl shadow-xl shadow-stone-200/60 border border-stone-200 flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜尋房型名稱、暗室、設備（如：Beseler、4K、投影）..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <button
              onClick={onScrollToRooms}
              className="w-full md:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              瀏覽所有空間
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-2 max-w-3xl mx-auto">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            全部空間
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">預約完全免費</p>
              <p className="text-xs text-stone-500">推廣期間 $0 元預約體驗</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">即時檔期確認</p>
              <p className="text-xs text-stone-500">即點即排，避免時段衝突</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100/60 text-purple-700 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">專業設備齊全</p>
              <p className="text-xs text-stone-500">專業暗房、4K會議、Podcast</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100/60 text-amber-700 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">隨時靈活取消</p>
              <p className="text-xs text-stone-500">會員中心一鍵線上退訂</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
