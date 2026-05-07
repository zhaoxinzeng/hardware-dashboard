import { useEffect, useMemo, useState } from 'react';
import type { EcoCase, CreateEcoCaseInput } from '../types/ecoCase';

const CASES_STORAGE_KEY = 'xinghe_cases_data';
const MAX_PINNED = 3;
const DEPRECATED_CASE_IDS = new Set([
    'ec1',
    'ec2',
    'ec3'
]);

const DEFAULT_CASES: EcoCase[] = [];

const sortByCreatedAtDesc = (a: EcoCase, b: EcoCase) => b.createdAt - a.createdAt;

const sortPinnedThenLatest = (a: EcoCase, b: EcoCase) => {
    if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
    }
    return sortByCreatedAtDesc(a, b);
};

const loadCasesFromStorage = (): EcoCase[] => {
    const normalizeCase = (ecoCase: EcoCase): EcoCase => ({
        ...ecoCase,
        url: typeof ecoCase.url === 'string' && ecoCase.url.trim()
            ? ecoCase.url.trim()
            : `https://invalid.local/pending-case-${ecoCase.id}`
    });

    const saved = localStorage.getItem(CASES_STORAGE_KEY);
    if (saved !== null) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                return parsed
                    .map(normalizeCase)
                    .filter((ecoCase) => !DEPRECATED_CASE_IDS.has(ecoCase.id));
            }
        } catch (error) {
            console.error('Failed to parse eco-cases data', error);
        }
    }
    return DEFAULT_CASES.map(normalizeCase);
};

const buildFeaturedCases = (allCases: EcoCase[]): EcoCase[] => {
    if (allCases.length === 0) return [];

    const pinned = allCases.filter(c => c.isPinned).sort(sortByCreatedAtDesc);
    const unpinned = allCases.filter(c => !c.isPinned).sort(sortByCreatedAtDesc);

    return [...pinned, ...unpinned].slice(0, 3);
};

export const useCasesData = () => {
    const [cases, setCases] = useState<EcoCase[]>(loadCasesFromStorage);

    useEffect(() => {
        localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
    }, [cases]);

    const sortedCases = useMemo(() => [...cases].sort(sortPinnedThenLatest), [cases]);

    const featuredCases = useMemo(() => buildFeaturedCases(cases), [cases]);

    const addCase = (input: CreateEcoCaseInput) => {
        const next: EcoCase = {
            id: `case_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            title: input.title.trim(),
            description: input.description.trim(),
            industry: input.industry.trim(),
            hardware: input.hardware.trim(),
            url: input.url.trim() || `https://invalid.local/pending-case-${Date.now()}`,
            isPinned: false,
            createdAt: Date.now()
        };
        setCases(prev => [next, ...prev]);
    };

    const updateCase = (id: string, updates: Partial<Omit<EcoCase, 'id' | 'isPinned' | 'createdAt'>>) => {
        setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const deleteCase = (id: string) => {
        setCases(prev => prev.filter(c => c.id !== id));
    };

    const togglePinCase = (id: string) => {
        setCases(prev => {
            const target = prev.find(c => c.id === id);
            if (!target) return prev;

            // If unpinning, just toggle
            if (target.isPinned) {
                return prev.map(c => c.id === id ? { ...c, isPinned: false } : c);
            }

            // If pinning, check limit
            const pinnedCount = prev.filter(c => c.isPinned).length;
            if (pinnedCount >= MAX_PINNED) {
                alert(`最多只能置顶 ${MAX_PINNED} 个案例，请先取消其他案例的置顶。`);
                return prev;
            }

            return prev.map(c => c.id === id ? { ...c, isPinned: true } : c);
        });
    };

    return {
        cases,
        sortedCases,
        featuredCases,
        addCase,
        updateCase,
        deleteCase,
        togglePinCase
    };
};
