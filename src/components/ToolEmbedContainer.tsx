import React, { useEffect, useRef, useState } from 'react';
import { LayoutTemplate } from 'lucide-react';

export const ToolEmbedContainer: React.FC = () => {
    const calculatorUrl = import.meta.env.VITE_CALCULATOR_URL as string | undefined;
    const ssoEmail = import.meta.env.VITE_CALCULATOR_SSO_EMAIL as string | undefined;
    const ssoPassword = import.meta.env.VITE_CALCULATOR_SSO_PASSWORD as string | undefined;
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [authReady, setAuthReady] = useState(false);
    const [showRetry, setShowRetry] = useState(false);
    const [hideHint, setHideHint] = useState(false);
    const [ssoInProgress, setSsoInProgress] = useState(false);
    const timeoutRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!calculatorUrl) return;
        const targetOrigin = new URL(calculatorUrl).origin;
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== targetOrigin) return;
            if (event.data?.type === 'authReady') {
                setAuthReady(true);
                setSsoInProgress(false);
                setShowRetry(false);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = undefined;
                }
            }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [calculatorUrl]);

    const onIframeLoad = () => {
        if (!calculatorUrl || !ssoEmail || !ssoPassword) return;
        const targetOrigin = new URL(calculatorUrl).origin;
        setSsoInProgress(true);
        setShowRetry(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
        iframeRef.current?.contentWindow?.postMessage(
            { type: 'ssoCredentials', email: ssoEmail, password: ssoPassword },
            targetOrigin
        );
        timeoutRef.current = window.setTimeout(() => {
            if (!authReady) {
                setShowRetry(true);
                setSsoInProgress(false);
            }
        }, 8000);
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight">外部资源计算器</h2>
            </div>

            {/* 
        This is the dedicated placeholder for external tools (e.g., an iframe).
        It features a soft inner shadow, rounded corners, and a minimum height of 500px as requested.
      */}
            <div className="w-full min-h-[500px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 shadow-inner flex flex-col items-center justify-center text-center p-6 relative overflow-hidden group transition-colors hover:bg-gray-50 hover:border-gray-400">

                {/* Decorative Grid Background */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0066FF 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                {calculatorUrl ? (
                    <>
                        <iframe
                            ref={iframeRef}
                            title="AI 企业需求计算器"
                            src={calculatorUrl}
                            className="absolute inset-0 w-full h-full rounded-xl border-none"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            onLoad={onIframeLoad}
                        />
                        {!authReady && !hideHint && (
                            <div className="relative z-10 mt-2 p-3 bg-white/80 rounded-md border text-xs text-gray-700 flex items-center gap-3">
                                <span>{ssoInProgress ? '正在建立单点登录会话…' : '未完成会话建立'}</span>
                                {showRetry && (
                                    <>
                                        <button
                                            className="px-2 py-1 rounded bg-[var(--color-tech-blue)] text-white"
                                            onClick={onIframeLoad}
                                        >
                                            重试SSO
                                        </button>
                                        <button
                                            className="px-2 py-1 rounded bg-gray-200 text-gray-700"
                                            onClick={() => setHideHint(true)}
                                        >
                                            隐藏提示
                                        </button>
                                    </>
                                )}
                                {!ssoEmail || !ssoPassword ? (
                                    <span className="text-[var(--color-text-secondary)]">未配置SSO凭据</span>
                                ) : null}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="relative z-10 flex flex-col items-center gap-4 text-gray-400 group-hover:text-gray-500 transition-colors">
                        <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100">
                            <LayoutTemplate className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-gray-700 mb-1">资源计算器组件加载区</p>
                            <p className="text-sm font-medium">(请在 .env.local 配置 VITE_CALCULATOR_URL、VITE_CALCULATOR_SSO_EMAIL、VITE_CALCULATOR_SSO_PASSWORD)</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
