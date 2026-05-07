import { useEffect, useMemo, useState } from 'react';
import type { CreateHardwareProductInput, HardwareProduct } from '../types/hardwareProduct';

const HARDWARE_PRODUCTS_STORAGE_KEY = 'xinghe_hardware_products_data';
const DEPRECATED_PRODUCT_IDS = new Set([
    'p1',
    'p2'
]);

const DEFAULT_PRODUCTS: HardwareProduct[] = [];

const sortFeaturedThenLatest = (a: HardwareProduct, b: HardwareProduct) => {
    if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
    }

    return b.createdAt - a.createdAt;
};

const sanitizeProduct = (raw: unknown): HardwareProduct | null => {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const item = raw as Partial<HardwareProduct>;
    if (typeof item.id !== 'string' || typeof item.title !== 'string') {
        return null;
    }

    const features = Array.isArray(item.features)
        ? item.features.filter((feature): feature is string => typeof feature === 'string').map(feature => feature.trim()).filter(Boolean)
        : [];

    return {
        id: item.id,
        title: item.title,
        subtitle: typeof item.subtitle === 'string' ? item.subtitle : '',
        vendorTag: typeof item.vendorTag === 'string' ? item.vendorTag : '',
        logoDataUrl: typeof item.logoDataUrl === 'string' ? item.logoDataUrl : '',
        features,
        isFeatured: Boolean(item.isFeatured),
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now()
    };
};

const loadProductsFromStorage = (): HardwareProduct[] => {
    const saved = localStorage.getItem(HARDWARE_PRODUCTS_STORAGE_KEY);
    if (saved !== null) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                return parsed
                    .map(sanitizeProduct)
                    .filter((item): item is HardwareProduct => item !== null)
                    .filter((product) => !DEPRECATED_PRODUCT_IDS.has(product.id));
            }
        } catch (error) {
            console.error('Failed to parse hardware products data', error);
        }
    }

    return DEFAULT_PRODUCTS
        .map(sanitizeProduct)
        .filter((item): item is HardwareProduct => item !== null);
};

export const useHardwareProductsData = () => {
    const [products, setProducts] = useState<HardwareProduct[]>(loadProductsFromStorage);

    useEffect(() => {
        localStorage.setItem(HARDWARE_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }, [products]);

    const sortedProducts = useMemo(
        () => [...products].sort(sortFeaturedThenLatest),
        [products]
    );

    const previewProducts = useMemo(
        () => sortedProducts.slice(0, 2),
        [sortedProducts]
    );

    const addProduct = (newProduct: CreateHardwareProductInput) => {
        const nextProduct: HardwareProduct = {
            id: `product_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            title: newProduct.title.trim(),
            subtitle: newProduct.subtitle.trim(),
            vendorTag: newProduct.vendorTag.trim(),
            logoDataUrl: newProduct.logoDataUrl.trim(),
            features: newProduct.features.map(feature => feature.trim()).filter(Boolean),
            isFeatured: newProduct.isFeatured,
            createdAt: Date.now()
        };

        setProducts(prev => [nextProduct, ...prev]);
    };

    const updateProduct = (
        id: string,
        updates: Partial<Omit<HardwareProduct, 'id' | 'createdAt'>>
    ) => {
        setProducts(prev => prev.map(product => (
            product.id === id ? { ...product, ...updates } : product
        )));
    };

    const toggleFeatured = (id: string) => {
        setProducts(prev => prev.map(product => (
            product.id === id ? { ...product, isFeatured: !product.isFeatured } : product
        )));
    };

    const removeProduct = (id: string) => {
        setProducts(prev => prev.filter(product => product.id !== id));
    };

    return {
        products,
        sortedProducts,
        previewProducts,
        addProduct,
        updateProduct,
        toggleFeatured,
        removeProduct
    };
};
