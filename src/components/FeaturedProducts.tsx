import React from 'react';
import { Check, Cpu, Server } from 'lucide-react';

const products = [
    {
        id: '1',
        name: '昇腾 910B 集群',
        vendor: 'Ascend',
        description: '面向万亿级参数大模型训练的智算中心底座',
        features: [
            '单芯片提供 320 TFLOPS FP16 算力',
            'HCCS 互联带宽直达 392GB/s',
            '无缝对接飞桨分布式训练框架'
        ],
        icon: <Cpu className="w-8 h-8 text-[var(--color-tech-blue)]" />
    },
    {
        id: '2',
        name: 'NVIDIA DGX SuperPOD',
        vendor: 'NVIDIA',
        description: '突破性能极限的全栈式 AI 数据中心基础设施',
        features: [
            '搭载 32 个 H200 Tensor Core GPU',
            'NVLink 4.0 实现 900 GB/s 极速互联',
            '提供端到端全生命周期开发软件栈'
        ],
        icon: <Server className="w-8 h-8 text-emerald-500" />
    }
];

export const FeaturedProducts: React.FC = () => {
    return (
        <div className="h-full glass-panel p-6 flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">多硬件产品介绍</h2>
                <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                    探索驱动大模型时代的高性能算力引擎
                </p>
            </div>

            <div className="flex-1 flex flex-col gap-5">
                {products.map((product) => (
                    <div key={product.id} className="relative group overflow-hidden rounded-xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50 p-5 hover:shadow-md hover:border-[var(--color-tech-blue)]/50 transition-all duration-300">
                        {/* Background Accent */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl group-hover:bg-blue-200/50 transition-colors pointer-events-none" />

                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
                                {product.icon}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-baseline justify-between mb-1">
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-[var(--color-tech-blue)] transition-colors">
                                        {product.name}
                                    </h3>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                        {product.vendor}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-4">
                                    {product.description}
                                </p>

                                <ul className="space-y-2">
                                    {product.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="leading-snug">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
