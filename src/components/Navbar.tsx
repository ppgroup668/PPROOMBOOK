import React from 'react';
import { 
  Building2, 
  Calendar, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Database,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { User } from '../types.ts';

interface NavbarProps {
  currentUser: User | null;
  activeView: 'home' | 'member' | 'admin';
  onNavigate: (view: 'home' | 'member' | 'admin') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenSchemaDocs: () => void;
  onLogout: () => void;
  onQuickLogin: (role: 'admin' | 'member') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onOpenAuth,
  onOpenSchemaDocs,
  onLogout,
  onQuickLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-stone-200 shadow-xs transition-all">
      {/* Top Demo Shortcut Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-stone-300">BookJor 全端預約系統</span>
          <span className="hidden sm:inline text-stone-500">|</span>
          <span className="text-amber-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> 預約全額免費
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-400 hidden md:inline">快速切換測試身分：</span>
          <button
            onClick={() => onQuickLogin('member')}
            className={`px-2 py-0.5 rounded text-xs transition font-medium ${
              currentUser?.role === 'member'
                ? 'bg-blue-600 text-white'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
          >
            一鍵登入會員
          </button>
          <button
            onClick={() => onQuickLogin('admin')}
            className={`px-2 py-0.5 rounded text-xs transition font-medium ${
              currentUser?.role === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
          >
            一鍵登入管理員
          </button>
          {currentUser && (
            <button
              onClick={onLogout}
              className="text-stone-400 hover:text-white text-xs ml-1 flex items-center gap-0.5"
              title="登出當前身分"
            >
              <LogOut className="w-3 h-3" /> 登出
            </button>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-stone-900">BookJor</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                Free
              </span>
            </div>
            <p className="text-[11px] text-stone-500 -mt-0.5">空間與暗室預訂系統</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
              activeView === 'home'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            空間房型
          </button>

          {currentUser?.role === 'member' && (
            <button
              onClick={() => onNavigate('member')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeView === 'member'
                  ? 'bg-stone-100 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              我的預約
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'bg-purple-50 text-purple-900 border border-purple-200 font-semibold'
                  : 'text-stone-600 hover:text-purple-700 hover:bg-stone-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              管理員後台
            </button>
          )}

          <button
            onClick={onOpenSchemaDocs}
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition flex items-center gap-1.5"
            title="查看 SQLite / MongoDB 架構與部屬說明"
          >
            <Database className="w-4 h-4 text-emerald-600" />
            資料庫架構 & 部屬
          </button>
        </nav>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-stone-900 flex items-center gap-1 justify-end">
                  {currentUser.name}
                  {currentUser.role === 'admin' && (
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                      管理員
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-stone-500">{currentUser.email}</span>
              </div>

              {currentUser.role === 'member' && (
                <button
                  onClick={() => onNavigate('member')}
                  className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition"
                  title="進入會員中心"
                >
                  <UserIcon className="w-4 h-4" />
                </button>
              )}

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="w-9 h-9 rounded-full bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center hover:bg-purple-100 transition"
                  title="進入管理後台"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onLogout}
                className="p-2 text-stone-400 hover:text-stone-600 transition"
                title="登出"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 transition flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                登入
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-900 text-white hover:bg-stone-800 transition shadow-sm"
              >
                免費註冊
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
              {currentUser.role === 'admin' ? '管理員' : '會員'}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition"
            aria-label="選單"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                activeView === 'home' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-700'
              }`}
            >
              空間房型首頁
            </button>

            {currentUser?.role === 'member' && (
              <button
                onClick={() => {
                  onNavigate('member');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium flex items-center gap-2 ${
                  activeView === 'member' ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-stone-700'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                會員預約紀錄
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium flex items-center gap-2 ${
                  activeView === 'admin' ? 'bg-purple-50 text-purple-900 font-semibold' : 'text-stone-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                管理員控制台 (Admin)
              </button>
            )}

            <button
              onClick={() => {
                onOpenSchemaDocs();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2.5 rounded-lg text-left text-sm font-medium text-stone-700 flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              資料庫架構與部屬指引
            </button>
          </div>

          <div className="pt-3 border-t border-stone-200">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-900">{currentUser.name}</p>
                  <p className="text-xs text-stone-500">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md font-medium"
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium rounded-lg border border-stone-300 text-stone-700"
                >
                  會員登入
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium rounded-lg bg-stone-900 text-white"
                >
                  註冊新帳號
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
