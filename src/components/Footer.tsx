import React from 'react';
import { Building2, Sparkles, Database, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'member' | 'admin') => void;
  onOpenSchemaDocs: () => void;
  onQuickLogin: (role: 'admin' | 'member') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenSchemaDocs,
  onQuickLogin,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-stone-900 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">BOOK LA</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                預約全免費
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md leading-relaxed">
              提供企業團隊、創業者與專案小組最靈活的會議空間預約服務。
              涵蓋會議室 A 至會議室 E，全配 4K 電子白板、高解析視訊系統與專用會議主機。
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              推廣計畫：全站會議室預約 NT$ 0 元，無隱藏費用
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              空間與預訂模組
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition"
                >
                  探索所有空間與房型
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('member')}
                  className="hover:text-white transition"
                >
                  會員中心與歷史預約
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white transition flex items-center gap-1 text-purple-300 hover:text-purple-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  管理員總控台 (Admin)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSchemaDocs}
                  className="hover:text-white transition flex items-center gap-1 text-emerald-300 hover:text-emerald-200"
                >
                  <Database className="w-3.5 h-3.5" />
                  資料庫 Schema 與部屬指南
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Test Demo */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">
              快速體驗切換
            </h4>
            <div className="space-y-2 text-xs">
              <p className="text-stone-400 text-[11px]">
                評估專用一鍵快捷登入：
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => onQuickLogin('member')}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-left transition font-medium"
                >
                  切換為一般會員 (user@example.com)
                </button>
                <button
                  onClick={() => onQuickLogin('admin')}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-purple-300 text-left transition font-medium"
                >
                  切換為管理員 (admin@bookla.com)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} BOOK LA 會議室預約系統. 版權所有．繁體中文版</p>
          <p className="flex items-center gap-1 text-[11px]">
            Designed with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for creators & administrators
          </p>
        </div>
      </div>
    </footer>
  );
};
