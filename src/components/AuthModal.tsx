import React, { useState } from 'react';
import { X, LogIn, UserPlus, User as UserIcon, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { User } from '../types.ts';
import { api, authStorage } from '../api.ts';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        authStorage.setToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({ name, email, phone, password });
        authStorage.setToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || '操作失敗，請檢查輸入資料');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Modal Top */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-stone-900 text-white">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </span>
            <h2 className="text-lg font-bold text-stone-900">
              {mode === 'login' ? '會員登入' : '免費註冊帳號'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-stone-100">
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition ${
              mode === 'login'
                ? 'text-stone-900 border-b-2 border-stone-900 bg-white'
                : 'text-stone-400 hover:text-stone-700 bg-stone-50'
            }`}
          >
            會員登入
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition ${
              mode === 'register'
                ? 'text-stone-900 border-b-2 border-stone-900 bg-white'
                : 'text-stone-400 hover:text-stone-700 bg-stone-50'
            }`}
          >
            建立新帳號
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                姓名 *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="陳大明"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-stone-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              電子郵件 (Email) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-stone-400"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                聯絡電話 / 手機 *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912-345-678"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-stone-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              密碼 (至少 6 個字元) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-stone-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                title={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? '處理中...' : mode === 'login' ? '登入帳號' : '註冊並完成登入'}
          </button>
        </form>
      </div>
    </div>
  );
};
