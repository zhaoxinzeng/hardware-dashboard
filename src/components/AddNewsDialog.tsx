import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface AddNewsDialogProps {
    onAddNews: (news: { title: string; date: string; imageUrl: string; summary: string; link: string }) => void;
}

export const AddNewsDialog: React.FC<AddNewsDialogProps> = ({ onAddNews }) => {
    const [open, setOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [imageUrl, setImageUrl] = useState('');
    const [summary, setSummary] = useState('');
    const [link, setLink] = useState('');

    const defaultImageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop'; // Tech placeholder

    const handleImagePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (!file) continue;

                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setImageUrl(event.target.result as string);
                        toast.success('图片已成功粘贴');
                    }
                };
                reader.readAsDataURL(file);
                e.preventDefault();
                break;
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('请填写新闻标题 (Title is required)');
            return;
        }

        onAddNews({
            title: title.trim(),
            date,
            imageUrl: imageUrl.trim() || defaultImageUrl,
            summary: summary.trim(),
            link: link.trim(),
        });

        toast.success('新闻发布成功！(News published successfully)');

        // Reset and close
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
        setImageUrl('');
        setSummary('');
        setLink('');
        setOpen(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-tech-blue)] hover:bg-[var(--color-tech-blue-hover)] text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    添加新闻
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-white rounded-2xl shadow-xl z-50 p-6 animate-in zoom-in-95 duration-200 border border-gray-100">
                    <Dialog.Title className="text-xl font-bold text-gray-900 mb-1">
                        发布生态新闻
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-500 mb-6">
                        添加一条关于硬件伙伴的最新适配进展或新闻动态。
                    </Dialog.Description>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="title" className="text-xs font-bold text-gray-700 uppercase">新闻标题 <span className="text-red-500">*</span></label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="例如：NVIDIA H200 适配最新进展..."
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="link" className="text-xs font-bold text-gray-700 uppercase">新闻链接 (可选)</label>
                            <input
                                id="link"
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="date" className="text-xs font-bold text-gray-700 uppercase">发布日期</label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="imageUrl" className="text-xs font-bold text-gray-700 uppercase">封面图链接 (可直接选中框内粘贴截图)</label>
                            <input
                                id="imageUrl"
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onPaste={handleImagePaste}
                                placeholder="https://... 或直接在此处 `Ctrl+V` / `Cmd+V` 粘贴图片"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all"
                            />
                            <p className="text-[10px] text-gray-400">如果不填且未粘贴图片，系统将使用默认的科技风占位图。</p>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="summary" className="text-xs font-bold text-gray-700 uppercase">新闻简介 (可选)</label>
                            <textarea
                                id="summary"
                                rows={3}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="简明扼要地描述新闻的核心内容..."
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-tech-blue)] focus:ring-1 focus:ring-[var(--color-tech-blue)] transition-all resize-none"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-gray-100">
                            <Dialog.Close asChild>
                                <button type="button" className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                    取消
                                </button>
                            </Dialog.Close>
                            <button type="submit" className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                                保存发布
                            </button>
                        </div>
                    </form>

                    <Dialog.Close asChild>
                        <button className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
                            <X className="w-5 h-5" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
