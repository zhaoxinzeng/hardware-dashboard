import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'user';

export interface User {
    username: string;
    role: UserRole;
}

interface AuthContextValue {
    isLoggedIn: boolean;
    currentUser: User | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const SESSION_KEY = 'mock_session';

// ── Helpers ────────────────────────────────────────────────────────────────────

const loadSession = (): User | null => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as unknown;
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'username' in parsed &&
            'role' in parsed &&
            typeof (parsed as User).username === 'string' &&
            ((parsed as User).role === 'admin' || (parsed as User).role === 'user')
        ) {
            return parsed as User;
        }
    } catch {
        // ignore
    }
    return null;
};

// ── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => loadSession());

    // Sync to localStorage whenever user changes
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
    }, [currentUser]);

    const login = useCallback((username: string, password: string): boolean => {
        const trimmedUser = username.trim();
        const trimmedPass = password.trim();
        if (!trimmedUser || !trimmedPass) return false;

        const role: UserRole = trimmedUser === 'admin' && trimmedPass === 'admin' ? 'admin' : 'user';
        setCurrentUser({ username: trimmedUser, role });
        return true;
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn: currentUser !== null, currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// ── Hook ───────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
