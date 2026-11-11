import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { RoomCard } from './components/RoomCard.tsx';
import { RoomDetailModal } from './components/RoomDetailModal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { MemberDashboard } from './components/MemberDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { SchemaDocsModal } from './components/SchemaDocsModal.tsx';
import { Footer } from './components/Footer.tsx';
import { User, Room, Booking } from './types.ts';
import { api, authStorage } from './api.ts';
import { Sparkles, Calendar, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'member' | 'admin'>('home');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [schemaModalOpen, setSchemaModalOpen] = useState<boolean>(false);

  const roomsSectionRef = useRef<HTMLDivElement>(null);

  // Check login state on mount
  useEffect(() => {
    const token = authStorage.getToken();
    if (token) {
      api.getMe()
        .then((res) => {
          setCurrentUser(res.user);
        })
        .catch(() => {
          authStorage.clearToken();
          setCurrentUser(null);
        });
    }
  }, []);

  // Fetch rooms
  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.getRooms();
      setRooms(res.rooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Extract categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    rooms.forEach((r) => cats.add(r.category));
    return Array.from(cats);
  }, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesCat = selectedCategory === 'all' || room.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        room.name.toLowerCase().includes(q) ||
        room.description.toLowerCase().includes(q) ||
        room.category.toLowerCase().includes(q) ||
        room.amenities.some((a) => a.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [rooms, selectedCategory, searchQuery]);

  // Quick Login helper
  const handleQuickLogin = async (role: 'admin' | 'member') => {
    try {
      const email = role === 'admin' ? 'ppgroup668@gmail.com' : 'user@example.com';
      const password = role === 'admin' ? '668668' : 'user123';
      const res = await api.login({ email, password });
      authStorage.setToken(res.token);
      setCurrentUser(res.user);

      if (role === 'admin') {
        setActiveView('admin');
      } else {
        setActiveView('member');
      }
    } catch (err: any) {
      alert(err.message || '快捷登入失敗');
    }
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setCurrentUser(null);
    setActiveView('home');
  };

  const handleNavigate = (view: 'home' | 'member' | 'admin') => {
    if (view === 'member' && !currentUser) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }
    if (view === 'admin' && currentUser?.role !== 'admin') {
      // Auto assist user to switch to admin test or show prompt
      if (confirm('此功能需管理員權限，是否立即以測試管理員帳號 (ppgroup668@gmail.com / 密碼: 668668) 登入？')) {
        handleQuickLogin('admin');
        return;
      }
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToRooms = () => {
    roomsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuth={(mode = 'login') => {
          setAuthInitialMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenSchemaDocs={() => setSchemaModalOpen(true)}
        onLogout={handleLogout}
        onQuickLogin={handleQuickLogin}
      />

      {/* Main Views */}
      <main className="flex-1">
        {/* VIEW 1: HOME LANDING & ROOMS */}
        {activeView === 'home' && (
          <div>
            <Hero
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onScrollToRooms={scrollToRooms}
            />

            {/* Room Catalog Section */}
            <div ref={roomsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    全開放預約會議室
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    精選會議室列表 (會議室 A 至 會議室 E)
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    精選會議室 A、B、C、D、E，支援董事決策會議、敏捷專案研討、小組頭腦風暴與大型培訓，預約全額免費。
                  </p>
                </div>

                <div className="text-xs text-stone-500">
                  共顯示 <strong className="text-stone-900">{filteredRooms.length}</strong> 間會議室
                </div>
              </div>

              {/* Room Cards Grid */}
              {loadingRooms ? (
                <div className="py-24 text-center text-stone-400 text-sm">
                  正在載入優質空間列表中...
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-stone-700">沒有找到符合條件的空間</p>
                  <p className="text-xs text-stone-500">
                    請嘗試更換搜尋關鍵字或切換「全部空間」分類標籤。
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
                  >
                    重設篩選條件
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onSelectBooking={(r) => setBookingRoom(r)}
                      onViewDetails={(r) => setDetailRoom(r)}
                    />
                  ))}
                </div>
              )}

              {/* Booking Process Steps Guide */}
              <div className="mt-20 bg-stone-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                    Zero Friction Booking
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    極致簡便的 3 步驟預訂流程
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400">
                    透明、快速、無需綁卡，讓您專注於空間帶來的創作價值
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mx-auto text-lg">
                      1
                    </div>
                    <h4 className="text-sm font-bold text-white">挑選房型與日期</h4>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      隨時查閱即時行事曆，即時反應用戶佔用狀況，防止檔期撞期衝突。
                    </p>
                  </div>

                  <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center mx-auto text-lg">
                      2
                    </div>
                    <h4 className="text-sm font-bold text-white">填寫聯絡資料</h4>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      輸入基本聯絡方式與特殊備註需求。會員登入後將自動智慧代入。
                    </p>
                  </div>

                  <div className="bg-stone-800/60 p-6 rounded-2xl border border-stone-700/60 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center mx-auto text-lg">
                      3
                    </div>
                    <h4 className="text-sm font-bold text-white">即刻確認保留</h4>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      系統發出專屬預約代碼，NT$ 0 元全額免費，並可隨時在會員中心管理或取消。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MEMBER DASHBOARD */}
        {activeView === 'member' && currentUser && (
          <MemberDashboard
            currentUser={currentUser}
            onExploreRooms={() => {
              setActiveView('home');
              setTimeout(() => scrollToRooms(), 100);
            }}
          />
        )}

        {/* VIEW 3: ADMIN DASHBOARD */}
        {activeView === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboard currentUser={currentUser} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenSchemaDocs={() => setSchemaModalOpen(true)}
        onQuickLogin={handleQuickLogin}
      />

      {/* MODAL 1: Detail Modal */}
      {detailRoom && (
        <RoomDetailModal
          room={detailRoom}
          onClose={() => setDetailRoom(null)}
          onBookRoom={(r) => {
            setDetailRoom(null);
            setBookingRoom(r);
          }}
        />
      )}

      {/* MODAL 2: Interactive Booking Modal */}
      {bookingRoom && (
        <BookingModal
          room={bookingRoom}
          currentUser={currentUser}
          onClose={() => setBookingRoom(null)}
          onBookingSuccess={(_b) => {
            loadRooms();
          }}
          onViewMyBookings={() => {
            setBookingRoom(null);
            if (currentUser) {
              setActiveView('member');
            } else {
              setAuthInitialMode('login');
              setAuthModalOpen(true);
            }
          }}
        />
      )}

      {/* MODAL 3: Auth Modal */}
      {authModalOpen && (
        <AuthModal
          initialMode={authInitialMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={(u) => {
            setCurrentUser(u);
            if (u.role === 'admin') {
              setActiveView('admin');
            } else {
              setActiveView('member');
            }
          }}
          onQuickLogin={handleQuickLogin}
        />
      )}

      {/* MODAL 4: Database Schema & Deployment Guide Modal */}
      {schemaModalOpen && (
        <SchemaDocsModal onClose={() => setSchemaModalOpen(false)} />
      )}
    </div>
  );
}
