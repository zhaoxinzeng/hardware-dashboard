import React from 'react';
import { Search, Bell } from 'lucide-react';

export const Header: React.FC = () => {
    return (
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

                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-tech-blue)] to-blue-400 p-0.5 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img src={"https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} alt="User Avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </header>
    );
};
