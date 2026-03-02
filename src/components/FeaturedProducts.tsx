import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHardwareProductsData } from '../hooks/useHardwareProductsData';
import { HardwareProductCard } from './HardwareProductCard';

export const FeaturedProducts: React.FC = () => {
    const { products, previewProducts } = useHardwareProductsData();

    return (
        <div className="h-full glass-panel p-6 flex flex-col">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">多硬件产品介绍</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                        探索驱动大模型时代的高性能算力引擎
                    </p>
                </div>

                <Link
                    to="/products"
                    className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center px-3 py-1.5 rounded-full transition-colors border border-gray-200/50 shrink-0"
                >
                    全部产品 ({products.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
            </div>

            {previewProducts.length === 0 ? (
                <div className="w-full py-16 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">暂无产品数据</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-5">
                    {previewProducts.map(product => (
                        <HardwareProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};
