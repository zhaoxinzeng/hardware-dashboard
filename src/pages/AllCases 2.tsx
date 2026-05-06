import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp, ExternalLink, Pin, Plus, Trash2, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCasesData } from '../hooks/useCasesData';
import { useAuth } from '../contexts/AuthContext';
import type { EcoCase } from '../types/ecoCase';

const createCaseDraft = () => ({
    title: '',
    description: '',
    industry: '',
    hardware: '',
    url: ''
});

export const AllCases: React.FC = () => {
    const { sortedCases, addCase, updateCase, deleteCase, togglePinCase } = useCasesData();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const [isAdding, setIsAdding] = useState(false);
    const [editingCase, setEditingCase] = useState<EcoCase | null>(null);
    const [draft, setDraft] = useState(createCaseDraft);

    const resetFormState = () => {
        setDraft(createCaseDraft());
        setEditingCase(null);
    };

    const handleSubmit = () => {
        const title = draft.title.trim();
        const description = draft.description.trim();
        const industry = draft.industry.trim();
        const hardware = draft.hardware.trim();
        const url = draft.url.trim();

        if (!title || !industry || !hardware) return;

        if (editingCase) {
            updateCase(editingCase.id, { title, description, industry, hardware, url });
        } else {
            addCase({ title, description, industry, hardware, url });
        }

        resetFormState();
        setIsAdding(false);
    };

    const handleStartEdit = (ecoCase: EcoCase) => {
        setEditingCase(ecoCase);
        setDraft({
            title: ecoCase.title,
            description: ecoCase.description,
            industry: ecoCase.industry,
            hardware: ecoCase.hardware,
            url: ecoCase.url
        });
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        resetFormState();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('确定要删除该案例吗？')) {
            deleteCase(id);
            if (editingCase?.id === id) {
                resetFormState();
            }
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const isFormValid = draft.title.trim() && draft.industry.trim() && draft.hardware.trim();

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)]">
            <header className="sticky top-0 z-50 glass-panel border-b border-border-subtle/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">全部生态案例</h1>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => {
                            if (isAdding) {
                                setIsAdding(false);
                                resetFormState();
                                return;
                            }
                            setIsAdding(true);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold border transition-colors ${isAdding
                            ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                            : 'bg-blue-50 text-[var(--color-tech-blue)] border-blue-100 hover:bg-blue-100'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        {isAdding ? '取消新增' : '添加案例'}
                    </button>
                )}
            </header>

            <main className="max-w-[1440px] mx-auto p-4 md:p-8 animate-in fade-in duration-500">
                <p className="text-gray-500 font-medium text-sm mb-6">
                    共 {sortedCases.length} 个案例，排序规则：置顶优先，其次按最新创建时间。
                </p>

                {isAdmin && isAdding && (
                    <section className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-white p-4 md:p-5">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">{editingCase ? '修改案例' : '新增案例'}</h2>
                        <p className="text-xs text-gray-500 mb-4">
                            {editingCase
                                ? '当前为编辑模式：修改后将原地更新该案例，不会改变置顶状态和创建时间。'
                                : '案例链接可暂时留空，保存时系统会自动生成占位无效链接，后续可再替换真实链接。'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="案例名称"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white md:col-span-2"
                                value={draft.title}
                                onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="行业领域（如：金融/医疗）"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={draft.industry}
                                onChange={e => setDraft(prev => ({ ...prev, industry: e.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="适配硬件（如：昆仑芯/海光）"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={draft.hardware}
                                onChange={e => setDraft(prev => ({ ...prev, hardware: e.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="案例链接（如：https://...）"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white md:col-span-2"
                                value={draft.url}
                                onChange={e => setDraft(prev => ({ ...prev, url: e.target.value }))}
                            />
                        </div>
                        <textarea
                            placeholder="案例简介（可选，建议一句话描述核心价值与落地效果）"
                            rows={2}
                            className="w-full mt-3 px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white resize-none"
                            value={draft.description}
                            onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <div className="mt-4 flex justify-end">
                            {editingCase && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors mr-2"
                                >
                                    取消
                                </button>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white"
                            >
                                {editingCase ? '保存修改' : '保存案例'}
                            </button>
                        </div>
                    </section>
                )}

                {sortedCases.length === 0 ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">暂无案例数据</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {sortedCases.map(ecoCase => (
                            <article key={ecoCase.id} className="bg-white rounded-xl border border-gray-200/70 shadow-sm flex flex-col overflow-hidden">
                                {/* Card Content */}
                                <a
                                    href={ecoCase.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 flex-1 hover:bg-gray-50/60 transition-colors group"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <h3 className="font-bold text-base text-gray-900 leading-snug group-hover:text-[var(--color-tech-blue)] transition-colors">
                                            {ecoCase.title}
                                        </h3>
                                        <ExternalLink className="w-4 h-4 text-gray-400 shrink-0 mt-0.5 group-hover:text-[var(--color-tech-blue)] transition-colors" />
                                    </div>

                                    <div className="flex gap-2 flex-wrap mb-2">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">
                                            {ecoCase.industry}
                                        </span>
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                                            {ecoCase.hardware}
                                        </span>
                                        {ecoCase.isPinned && (
                                            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm flex items-center border border-amber-200/60">
                                                <Pin className="w-2.5 h-2.5 mr-0.5 fill-amber-700" /> 置顶
                                            </span>
                                        )}
                                    </div>

                                    {ecoCase.description && (
                                        <p className="line-clamp-2 text-sm text-gray-500 mt-2">{ecoCase.description}</p>
                                    )}
                                </a>

                                {/* Management Action Bar */}
                                {isAdmin && (
                                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 flex justify-end gap-4">
                                        <button
                                            onClick={() => togglePinCase(ecoCase.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold border transition-colors ${ecoCase.isPinned
                                                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                : 'text-gray-700 bg-gray-100 border-gray-200 hover:bg-gray-200'
                                                }`}
                                        >
                                            <ArrowUp className="w-3.5 h-3.5" />
                                            {ecoCase.isPinned ? '取消置顶' : '置顶'}
                                        </button>

                                        <button
                                            onClick={() => handleStartEdit(ecoCase)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 hover:bg-blue-50 hover:text-[var(--color-tech-blue)] hover:border-blue-200 transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            编辑
                                        </button>

                                        <button
                                            onClick={() => handleDelete(ecoCase.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            删除
                                        </button>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
