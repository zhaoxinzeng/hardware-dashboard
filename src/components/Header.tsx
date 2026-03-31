import React, { useRef, useState } from 'react';
import { Search, Bell, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ── Login Dialog ───────────────────────────────────────────────────────────────

const LoginDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const ok = login(username, password);
        if (ok) {
            onClose();
        } else {
            setError('用户名和密码不能为空');
        }
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-7 animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-lg font-bold text-gray-900 mb-1">登录</h2>
                <p className="text-xs text-gray-400 mb-6">
                    输入 <span className="font-mono font-semibold text-gray-600">admin / admin</span> 获取管理员权限
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        autoFocus
                        type="text"
                        placeholder="用户名"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setError(''); }}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
                    />
                    <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
                    />
                    {error && <p className="text-xs text-rose-500">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors"
                    >
                        确认登录
                    </button>
                </form>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors text-lg leading-none"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

// ── User Dropdown ──────────────────────────────────────────────────────────────

const UserDropdown: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!currentUser) return null;

    const initial = currentUser.username.charAt(0).toUpperCase();
    const isAdmin = currentUser.role === 'admin';

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-1.5 p-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-300 transition"
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-tech-blue)] to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
                    {initial}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info */}
                    <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{currentUser.username}</p>
                        <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isAdmin ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {isAdmin ? '当前身份：Admin' : '当前身份：User'}
                        </span>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => { logout(); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        退出登录
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Header ─────────────────────────────────────────────────────────────────────

export const Header: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-50 glass-panel border-b border-border-subtle/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-tech-blue)] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">
                        大模型多硬件生态监控看板
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--color-tech-blue)] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search ecosystem..."
                            className="pl-9 pr-4 py-2 bg-gray-100/50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-[var(--color-tech-blue)]/30 focus:ring-2 focus:ring-[var(--color-tech-blue)]/10 rounded-full text-sm outline-none transition-all w-64"
                        />
                    </div>

                    <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* Auth Area */}
                    {isLoggedIn ? (
                        <UserDropdown />
                    ) : (
                        <button
                            onClick={() => setShowLogin(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            登录
                        </button>
                    )}
                </div>
            </header>

            {showLogin && <LoginDialog onClose={() => setShowLogin(false)} />}
        </>
    );
};
