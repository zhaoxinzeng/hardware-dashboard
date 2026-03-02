import { useEffect, useMemo, useState } from 'react';
import type { CreateHardwareProductInput, HardwareProduct } from '../types/hardwareProduct';

const HARDWARE_PRODUCTS_STORAGE_KEY = 'xinghe_hardware_products_data';

const DEFAULT_PRODUCTS: HardwareProduct[] = [
    {
        id: 'p1',
        title: '昇腾 910B 集群',
        subtitle: '面向万亿级参数大模型训练的智算中心底座',
        vendorTag: 'Ascend',
        logoDataUrl: '',
        features: [
            '单芯片提供 320 TFLOPS FP16 算力',
            'HCCS 互联带宽直达 392GB/s',
            '无缝对接飞桨分布式训练框架'
        ],
        isFeatured: true,
        createdAt: Date.now() - 3000
    },
    {
        id: 'p2',
        title: 'NVIDIA DGX SuperPOD',
        subtitle: '突破性能极限的全栈式 AI 数据中心基础设施',
        vendorTag: 'NVIDIA',
        logoDataUrl: '',
        features: [
            '搭载 32 个 H200 Tensor Core GPU',
            'NVLink 4.0 实现 900 GB/s 极速互联',
            '提供端到端全生命周期开发软件栈'
        ],
        isFeatured: false,
        createdAt: Date.now() - 2000
    }
];

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
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const products = parsed
                    .map(sanitizeProduct)
                    .filter((item): item is HardwareProduct => item !== null);

                if (products.length > 0) {
                    return products;
                }
            }
        } catch (error) {
            console.error('Failed to parse hardware products data', error);
        }
    }

    return DEFAULT_PRODUCTS;
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

