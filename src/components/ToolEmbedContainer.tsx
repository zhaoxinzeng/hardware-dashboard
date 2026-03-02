import React, { useCallback, useEffect, useMemo, useState } from 'react';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function resolveConfiguredUrl() {
    const configuredUrl = (import.meta.env.VITE_AI_CALCULATOR_URL || '').trim();

    if (typeof window === 'undefined') {
        return configuredUrl || '';
    }

    if (!configuredUrl) {
        return '';
    }

    try {
        const parsed = new URL(configuredUrl, window.location.origin);
        const currentHost = window.location.hostname;
        const targetIsLocal = LOCAL_HOSTS.has(parsed.hostname);
        const currentIsLocal = LOCAL_HOSTS.has(currentHost);

        if (targetIsLocal && !currentIsLocal) {
            parsed.hostname = currentHost;
        }

        return parsed.toString();
    } catch {
        return configuredUrl;
    }
}

function buildCandidateUrls() {
    const configuredUrl = resolveConfiguredUrl();

    if (typeof window === 'undefined') {
        return configuredUrl ? [configuredUrl] : ['http://localhost:3001', 'http://localhost:3000'];
    }

    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const candidates = [
        configuredUrl,
        `${protocol}//${host}:3001`,
        `${protocol}//${host}:3000`,
        'http://localhost:3001',
        'http://localhost:3000',
    ].filter(Boolean);

    const unique: string[] = [];
    for (const item of candidates) {
        try {
            const normalized = new URL(item).toString();
            if (!unique.includes(normalized)) {
                unique.push(normalized);
            }
        } catch {
            if (!unique.includes(item)) {
                unique.push(item);
            }
        }
    }

    return unique;
}

export const ToolEmbedContainer: React.FC = () => {
    const candidates = useMemo(() => buildCandidateUrls(), []);
    const [calculatorUrl, setCalculatorUrl] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(true);
    const [probeTick, setProbeTick] = useState(0);

    const probeUrl = useCallback(async (url: string, timeoutMs = 1500) => {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), timeoutMs);
        try {
            const healthCheckUrl = new URL('/api/status', url).toString();
            await fetch(healthCheckUrl, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
            return true;
        } catch {
            return false;
        } finally {
            window.clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const pickReachableUrl = async () => {
            setIsResolving(true);
            for (const url of candidates) {
                const ok = await probeUrl(url);
                if (ok) {
                    if (!cancelled) {
                        setCalculatorUrl(url);
                        setIsResolving(false);
                    }
                    return;
                }
            }

            if (!cancelled) {
                setCalculatorUrl(null);
                setIsResolving(false);
            }
        };

        void pickReachableUrl();

        const interval = window.setInterval(() => {
            void pickReachableUrl();
        }, 4000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [candidates, probeTick, probeUrl]);

    return (
        <div className="w-full">
            <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight">外部资源计算器</h2>
            </div>

            <div className="w-full min-h-[600px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm relative">
                {calculatorUrl ? (
                    <iframe
                        src={calculatorUrl}
                        title="AI 资源计算器"
                        key={calculatorUrl}
                        className="h-[760px] w-full border-0"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="clipboard-write"
                    />
                ) : (
                    <div className="flex h-[760px] w-full flex-col items-center justify-center gap-3 bg-gray-50/60 text-center px-6">
                        <p className="text-sm text-gray-700">
                            {isResolving ? '正在连接资源计算器...' : '暂未连接到资源计算器服务'}
                        </p>
                        <p className="text-xs text-gray-500">
                            请确保 `npm run dev:calculator` 正在运行，系统会自动重试。
                        </p>
                        <button
                            type="button"
                            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                            onClick={() => setProbeTick((v) => v + 1)}
                        >
                            立即重试
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
