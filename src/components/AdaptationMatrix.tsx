import React from 'react';
import { CheckCircle2, Loader2, Clock } from 'lucide-react';

const frameworks = ['文心一言 4.0', '飞桨 PaddlePaddle', '千帆大模型平台'];
const hardwareVendors = ['NVIDIA', '昇腾', '昆仑芯', '燧原'];

type Status = 'ready' | 'progress' | 'planned';

const statusMap: Record<string, Record<string, Status>> = {
    '文心一言 4.0': {
        'NVIDIA': 'ready',
        '昇腾': 'ready',
        '昆仑芯': 'progress',
        '燧原': 'planned'
    },
    '飞桨 PaddlePaddle': {
        'NVIDIA': 'ready',
        '昇腾': 'ready',
        '昆仑芯': 'ready',
        '燧原': 'progress'
    },
    '千帆大模型平台': {
        'NVIDIA': 'progress',
        '昇腾': 'progress',
        '昆仑芯': 'planned',
        '燧原': 'planned'
    }
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
    switch (status) {
        case 'ready':
            return (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">已跑通</span>
                </div>
            );
        case 'progress':
            return (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Loader2 className="w-3.5 h-3.5 animate-spin-slow" />
                    <span className="text-xs font-semibold">适配中</span>
                </div>
            );
        case 'planned':
            return (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">规划中</span>
                </div>
            );
    }
};

export const AdaptationMatrix: React.FC = () => {
    return (
        <div className="w-full glass-panel overflow-hidden">
            <div className="p-6 border-b border-border-subtle/50">
                <h2 className="text-2xl font-bold tracking-tight">ERNIE/PaddlePaddle 硬件适配矩阵</h2>
                <p className="text-[var(--color-text-secondary)] text-sm mt-1">实时追踪各大模型与底层生态硬件的兼容性及优化进度</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="p-4 font-semibold text-sm text-[var(--color-text-secondary)] border-b border-border-subtle/50">
                                模型 / 框架
                            </th>
                            {hardwareVendors.map(vendor => (
                                <th key={vendor} className="p-4 font-semibold text-sm text-gray-900 border-b border-border-subtle/50">
                                    {vendor}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/30">
                        {frameworks.map((fw) => (
                            <tr key={fw} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-4 font-medium text-gray-900">
                                    {fw}
                                </td>
                                {hardwareVendors.map(vendor => (
                                    <td key={vendor} className="p-4">
                                        <StatusBadge status={statusMap[fw]?.[vendor] || 'planned'} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
