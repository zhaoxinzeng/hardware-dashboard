import React from 'react';
import { Check } from 'lucide-react';
import type { HardwareProduct } from '../types/hardwareProduct';

interface HardwareProductCardProps {
    product: HardwareProduct;
    footer?: React.ReactNode;
}

const ProductLogo: React.FC<{ product: HardwareProduct }> = ({ product }) => {
    if (product.logoDataUrl) {
        return (
            <img
                src={product.logoDataUrl}
                alt={`${product.title} logo`}
                className="w-12 h-12 object-contain"
            />
        );
    }

    return (
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center text-[var(--color-tech-blue)] font-black text-sm">
            {(product.vendorTag || product.title).slice(0, 2).toUpperCase()}
        </div>
    );
};

export const HardwareProductCard: React.FC<HardwareProductCardProps> = ({ product, footer }) => {
    const wrapperClassName = product.isFeatured
        ? 'relative overflow-hidden rounded-xl border p-5 transition-all duration-300 shadow-sm border-[var(--color-tech-blue)]/40 bg-gradient-to-br from-blue-50/70 via-white to-white ring-1 ring-blue-100/80'
        : 'relative overflow-hidden rounded-xl border p-5 transition-all duration-300 shadow-sm border-gray-200/70 bg-gradient-to-br from-white to-gray-50';

    return (
        <article className={wrapperClassName}>
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

            <span className="absolute top-4 right-4 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-900/90 text-white tracking-wide">
                {product.vendorTag || 'Vendor'}
            </span>

            <div className="relative z-10 pr-20">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm shrink-0">
                        <ProductLogo product={product} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">{product.title}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-2 line-clamp-2">
                            {product.subtitle}
                        </p>
                    </div>
                </div>

                <ul className="space-y-2.5 mt-4">
                    {product.features.map((feature, index) => (
                        <li key={`${product.id}-feature-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{feature}</span>
                        </li>
                    ))}
                </ul>

                {footer && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        {footer}
                    </div>
                )}
            </div>
        </article>
    );
};

