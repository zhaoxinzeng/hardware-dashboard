import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Plus, Sparkles, Trash2, ClipboardPaste, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { HardwareProductCard } from '../components/HardwareProductCard';
import { useHardwareProductsData } from '../hooks/useHardwareProductsData';
import type { HardwareProduct } from '../types/hardwareProduct';

const createProductDraft = () => ({
    title: '',
    subtitle: '',
    vendorTag: '',
    logoDataUrl: '',
    featuresText: '',
    isFeatured: true
});

export const AllHardwareProducts: React.FC = () => {
    const { sortedProducts, addProduct, updateProduct, toggleFeatured, removeProduct } = useHardwareProductsData();

    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<HardwareProduct | null>(null);
    const [formData, setFormData] = useState(createProductDraft);

    const resetFormState = () => {
        setFormData(createProductDraft());
        setEditingProduct(null);
    };

    const parseFeatures = (featuresText: string) => (
        featuresText
            .split('\n')
            .map(item => item.trim())
            .filter(Boolean)
    );

    const handlePasteLogoImage = (event: React.ClipboardEvent<HTMLElement>) => {
        const items = event.clipboardData?.items;
        if (!items) {
            return;
        }

        for (let index = 0; index < items.length; index += 1) {
            if (!items[index].type.startsWith('image/')) {
                continue;
            }

            const file = items[index].getAsFile();
            if (!file) {
                continue;
            }

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const base64 = readerEvent.target?.result;
                if (typeof base64 === 'string') {
                    setFormData(prev => ({ ...prev, logoDataUrl: base64 }));
                    toast.success('图片已粘贴到产品 Logo');
                }
            };
            reader.readAsDataURL(file);
            event.preventDefault();
            return;
        }

        toast.error('未检测到图片，请复制图片后再粘贴');
    };

    const handleSubmit = () => {
        const title = formData.title.trim();
        const subtitle = formData.subtitle.trim();
        const vendorTag = formData.vendorTag.trim();
        const features = parseFeatures(formData.featuresText);

        if (!title || !subtitle || !vendorTag || features.length === 0) {
            toast.error('请完整填写标题、副标题、厂商标签及至少一条特性');
            return;
        }

        const payload = {
            title,
            subtitle,
            vendorTag,
            logoDataUrl: formData.logoDataUrl.trim(),
            features,
            isFeatured: formData.isFeatured
        };

        if (editingProduct) {
            updateProduct(editingProduct.id, payload);
            toast.success('产品信息已更新');
        } else {
            addProduct(payload);
            toast.success('产品已新增');
        }

        resetFormState();
        setIsAdding(false);
    };

    const handleStartEdit = (product: HardwareProduct) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            subtitle: product.subtitle,
            vendorTag: product.vendorTag,
            logoDataUrl: product.logoDataUrl,
            featuresText: product.features.join('\n'),
            isFeatured: product.isFeatured
        });
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('确定要删除该产品吗？')) {
            removeProduct(id);
            if (editingProduct?.id === id) {
                resetFormState();
                setIsAdding(false);
            }
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">全部多硬件产品</h1>
                </div>

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
                    {isAdding ? '取消新增' : '新增产品'}
                </button>
            </header>

            <main className="max-w-[1440px] mx-auto p-4 md:p-8 animate-in fade-in duration-500">
                <p className="text-gray-500 font-medium text-sm mb-6">
                    共 {sortedProducts.length} 个产品，排序规则：高亮优先，其次按最新创建时间。
                </p>

                {isAdding && (
                    <section className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-white p-4 md:p-5">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">{editingProduct ? '编辑产品' : '新增产品'}</h2>
                        <p className="text-xs text-gray-500 mb-4">
                            {editingProduct
                                ? '当前为编辑模式：保存后将原地更新该产品，不会改变创建时间。'
                                : '可直接粘贴图片到 Logo 区域，系统会自动保存为 base64 数据。'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="产品名称"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={formData.title}
                                onChange={event => setFormData(prev => ({ ...prev, title: event.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="产品副标题"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={formData.subtitle}
                                onChange={event => setFormData(prev => ({ ...prev, subtitle: event.target.value }))}
                            />
                            <input
                                type="text"
                                placeholder="厂商 Tag (如 Ascend)"
                                className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                value={formData.vendorTag}
                                onChange={event => setFormData(prev => ({ ...prev, vendorTag: event.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
                            <div
                                tabIndex={0}
                                onPaste={handlePasteLogoImage}
                                className="lg:col-span-1 min-h-32 rounded-md border border-dashed border-blue-300 bg-blue-50/40 p-3 flex flex-col justify-center items-center text-center text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                {formData.logoDataUrl ? (
                                    <img src={formData.logoDataUrl} alt="logo preview" className="max-h-20 object-contain mb-2" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-blue-500 mb-2" />
                                )}
                                <span className="font-semibold text-gray-700">Logo 粘贴区</span>
                                <span className="mt-1">聚焦后按 Ctrl/Cmd + V 直接粘贴图片</span>
                                {formData.logoDataUrl && (
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, logoDataUrl: '' }))}
                                        className="mt-2 px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        清空图片
                                    </button>
                                )}
                            </div>

                            <div className="lg:col-span-2 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Logo Data URL（可选，支持手动粘贴 data:image/...）"
                                    className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                    value={formData.logoDataUrl}
                                    onPaste={handlePasteLogoImage}
                                    onChange={event => setFormData(prev => ({ ...prev, logoDataUrl: event.target.value }))}
                                />
                                <textarea
                                    placeholder="产品特性（每行一条）\n例如：\n单芯片提供 320 TFLOPS FP16 算力\nHCCS 互联带宽直达 392GB/s"
                                    rows={5}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white resize-none"
                                    value={formData.featuresText}
                                    onChange={event => setFormData(prev => ({ ...prev, featuresText: event.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={event => setFormData(prev => ({ ...prev, isFeatured: event.target.checked }))}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                                />
                                设为高亮卡片（蓝色边框 + 浅蓝背景）
                            </label>

                            <div className="flex items-center gap-2">
                                {editingProduct && (
                                    <button
                                        onClick={() => {
                                            resetFormState();
                                            setIsAdding(false);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                                    >
                                        取消
                                    </button>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <ClipboardPaste className="w-4 h-4" />
                                    {editingProduct ? '保存修改' : '保存产品'}
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {sortedProducts.length === 0 ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">暂无产品数据</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {sortedProducts.map(product => (
                            <HardwareProductCard
                                key={product.id}
                                product={product}
                                footer={(
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleStartEdit(product)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 hover:bg-blue-50 hover:text-[var(--color-tech-blue)] hover:border-blue-200 transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            编辑
                                        </button>

                                        <button
                                            onClick={() => toggleFeatured(product.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold border transition-colors ${product.isFeatured
                                                ? 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
                                                : 'text-gray-700 bg-gray-100 border-gray-200 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            {product.isFeatured ? '取消高亮' : '设为高亮'}
                                        </button>

                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            删除
                                        </button>
                                    </div>
                                )}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
