import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'hardware_matrix_data';
const DEFAULT_SUB_ITEM_NAME = '模型服务 (推理)';

type CellStatus = '已跑通' | '适配中' | '规划中';

type SubItem = {
    id: string;
    name: string;
};

type ModelItem = {
    id: string;
    name: string;
    description: string;
    subItems: SubItem[];
};

type HardwareItem = {
    id: string;
    vendor: string;
    specificModel: string;
};

type MatrixData = {
    models: ModelItem[];
    hardwares: HardwareItem[];
    matrix: Record<string, CellStatus>;
};

type ParentAggregateStatus = '全面适配' | '部分适配' | '未适配';

const STATUS_OPTIONS: CellStatus[] = ['已跑通', '适配中', '规划中'];

const STATUS_CLASS_MAP: Record<CellStatus, string> = {
    已跑通: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    适配中: 'bg-amber-50 text-amber-700 border-amber-200',
    规划中: 'bg-slate-50 text-slate-600 border-slate-200'
};

const PARENT_STATUS_CLASS_MAP: Record<ParentAggregateStatus, string> = {
    全面适配: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    部分适配: 'bg-amber-50 text-amber-700 border-amber-200',
    未适配: 'bg-slate-50 text-slate-500 border-slate-200'
};

const DEFAULT_MATRIX_DATA: MatrixData = {
    models: [
        {
            id: 'm1',
            name: 'ERNIE-4.5-0.3B',
            description: '',
            subItems: [
                { id: 'm1-sub1', name: '模型服务 (推理)' },
                { id: 'm1-sub2', name: 'SFT - LoRA' },
                { id: 'm1-sub3', name: 'SFT - 全量更新' }
            ]
        },
        {
            id: 'm2',
            name: '飞桨 PaddlePaddle',
            description: '',
            subItems: [
                { id: 'm2-sub1', name: '模型服务 (推理)' },
                { id: 'm2-sub2', name: 'SFT - LoRA' },
                { id: 'm2-sub3', name: 'SFT - 全量更新' }
            ]
        },
        {
            id: 'm3',
            name: '千帆大模型平台',
            description: '',
            subItems: [
                { id: 'm3-sub1', name: '模型服务 (推理)' },
                { id: 'm3-sub2', name: 'SFT - LoRA' },
                { id: 'm3-sub3', name: 'SFT - 全量更新' }
            ]
        }
    ],
    hardwares: [
        { id: 'h1', vendor: 'NVIDIA', specificModel: '' },
        { id: 'h2', vendor: '昇腾', specificModel: '' },
        { id: 'h3', vendor: '昆仑芯', specificModel: '' },
        { id: 'h4', vendor: '燧原', specificModel: '' }
    ],
    matrix: {
        'm1-sub1_h1': '已跑通',
        'm1-sub1_h2': '已跑通',
        'm1-sub1_h3': '适配中',
        'm1-sub1_h4': '规划中',
        'm1-sub2_h1': '已跑通',
        'm1-sub2_h2': '适配中',
        'm1-sub2_h3': '规划中',
        'm1-sub2_h4': '规划中',
        'm1-sub3_h1': '适配中',
        'm1-sub3_h2': '规划中',
        'm1-sub3_h3': '规划中',
        'm1-sub3_h4': '规划中',
        'm2-sub1_h1': '已跑通',
        'm2-sub1_h2': '已跑通',
        'm2-sub1_h3': '已跑通',
        'm2-sub1_h4': '适配中',
        'm2-sub2_h1': '已跑通',
        'm2-sub2_h2': '适配中',
        'm2-sub2_h3': '适配中',
        'm2-sub2_h4': '规划中',
        'm2-sub3_h1': '规划中',
        'm2-sub3_h2': '规划中',
        'm2-sub3_h3': '适配中',
        'm2-sub3_h4': '规划中',
        'm3-sub1_h1': '已跑通',
        'm3-sub1_h2': '适配中',
        'm3-sub1_h3': '规划中',
        'm3-sub1_h4': '规划中',
        'm3-sub2_h1': '适配中',
        'm3-sub2_h2': '规划中',
        'm3-sub2_h3': '规划中',
        'm3-sub2_h4': '规划中',
        'm3-sub3_h1': '规划中',
        'm3-sub3_h2': '规划中',
        'm3-sub3_h3': '规划中',
        'm3-sub3_h4': '规划中'
    }
};

const LEGACY_STATUS_MAP: Record<string, CellStatus> = {
    ready: '已跑通',
    progress: '适配中',
    planned: '规划中'
};

const getCellKey = (itemId: string, hardwareId: string): string => `${itemId}_${hardwareId}`;

const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const normalizeStatus = (value: unknown): CellStatus => {
    if (typeof value === 'string') {
        if (STATUS_OPTIONS.includes(value as CellStatus)) {
            return value as CellStatus;
        }
        if (LEGACY_STATUS_MAP[value]) {
            return LEGACY_STATUS_MAP[value];
        }
    }
    return '规划中';
};

const normalizeSubItems = (rawSubItems: unknown, modelId: string): SubItem[] => {
    const parsed = Array.isArray(rawSubItems)
        ? rawSubItems
            .map((item) => {
                if (!isObject(item)) return null;
                const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : '';
                if (!id) return null;
                return {
                    id,
                    name: typeof item.name === 'string' ? item.name : ''
                };
            })
            .filter((item): item is SubItem => item !== null)
        : [];

    if (parsed.length > 0) {
        return parsed;
    }

    return [{ id: `${modelId}-sub1`, name: DEFAULT_SUB_ITEM_NAME }];
};

const normalizeMatrixData = (rawValue: unknown): MatrixData => {
    if (!isObject(rawValue)) {
        return normalizeMatrixData(DEFAULT_MATRIX_DATA);
    }

    const rawModels = Array.isArray(rawValue.models) ? rawValue.models : [];
    const rawHardwares = Array.isArray(rawValue.hardwares) ? rawValue.hardwares : [];
    const rawMatrix = isObject(rawValue.matrix) ? (rawValue.matrix as Record<string, unknown>) : {};

    const models: ModelItem[] = rawModels
        .map((item) => {
            if (!isObject(item)) return null;
            const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : '';
            const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : '';
            if (!id || !name) return null;
            return {
                id,
                name,
                description: typeof item.description === 'string' ? item.description : '',
                subItems: normalizeSubItems(item.subItems, id)
            };
        })
        .filter((item): item is ModelItem => item !== null);

    const hardwares: HardwareItem[] = rawHardwares
        .map((item) => {
            if (!isObject(item)) return null;
            const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : '';
            const vendor = typeof item.vendor === 'string' && item.vendor.trim() ? item.vendor.trim() : '';
            if (!id || !vendor) return null;
            return {
                id,
                vendor,
                specificModel: typeof item.specificModel === 'string' ? item.specificModel : ''
            };
        })
        .filter((item): item is HardwareItem => item !== null);

    const matrix: Record<string, CellStatus> = {};
    models.forEach((model) => {
        hardwares.forEach((hardware) => {
            const parentKey = getCellKey(model.id, hardware.id);
            matrix[parentKey] = normalizeStatus(rawMatrix[parentKey]);

            model.subItems.forEach((subItem) => {
                const subKey = getCellKey(subItem.id, hardware.id);
                matrix[subKey] = normalizeStatus(rawMatrix[subKey] ?? rawMatrix[parentKey]);
            });
        });
    });

    return { models, hardwares, matrix };
};

const loadInitialMatrixData = (): MatrixData => {
    if (typeof window === 'undefined') {
        return normalizeMatrixData(DEFAULT_MATRIX_DATA);
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return normalizeMatrixData(DEFAULT_MATRIX_DATA);
        }
        return normalizeMatrixData(JSON.parse(stored));
    } catch (error) {
        console.error('读取硬件适配矩阵缓存失败，使用默认数据。', error);
        return normalizeMatrixData(DEFAULT_MATRIX_DATA);
    }
};

const createId = (prefix: 'm' | 'h' | 's'): string => {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
};

const resolveStatus = (matrix: Record<string, CellStatus>, itemId: string, hardwareId: string): CellStatus => {
    return matrix[getCellKey(itemId, hardwareId)] || '规划中';
};

const getParentAggregateStatus = (
    model: ModelItem,
    hardwareId: string,
    matrix: Record<string, CellStatus>
): ParentAggregateStatus => {
    const targetIds = model.subItems.length > 0 ? model.subItems.map((subItem) => subItem.id) : [model.id];
    const statuses = targetIds.map((itemId) => resolveStatus(matrix, itemId, hardwareId));

    if (statuses.length === 0) {
        return '未适配';
    }

    if (statuses.every((status) => status === '已跑通')) {
        return '全面适配';
    }

    if (statuses.some((status) => status === '已跑通' || status === '适配中')) {
        return '部分适配';
    }

    return '未适配';
};

export const AdaptationMatrix: React.FC = () => {
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const [data, setData] = useState<MatrixData>(() => loadInitialMatrixData());
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
    const [newModelName, setNewModelName] = useState('');
    const [newModelDescription, setNewModelDescription] = useState('');
    const [newHardwareVendor, setNewHardwareVendor] = useState('');
    const [newHardwareSpecificModel, setNewHardwareSpecificModel] = useState('');

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('保存硬件适配矩阵缓存失败。', error);
        }
    }, [data]);

    const statusClassByKey = useMemo(() => {
        const classes: Record<string, string> = {};

        data.models.forEach((model) => {
            const itemIds = [model.id, ...model.subItems.map((subItem) => subItem.id)];
            itemIds.forEach((itemId) => {
                data.hardwares.forEach((hardware) => {
                    const key = getCellKey(itemId, hardware.id);
                    classes[key] = STATUS_CLASS_MAP[resolveStatus(data.matrix, itemId, hardware.id)];
                });
            });
        });

        return classes;
    }, [data]);

    const handleCellStatusChange = (itemId: string, hardwareId: string, status: CellStatus) => {
        if (!isAdmin) return;
        const key = getCellKey(itemId, hardwareId);
        setData((prev) => ({
            ...prev,
            matrix: { ...prev.matrix, [key]: status }
        }));
    };

    const handleModelChange = (modelId: string, field: 'name' | 'description', value: string) => {
        if (!isAdmin) return;
        setData((prev) => ({
            ...prev,
            models: prev.models.map((item) => (item.id === modelId ? { ...item, [field]: value } : item))
        }));
    };

    const handleSubItemNameChange = (modelId: string, subItemId: string, value: string) => {
        if (!isAdmin) return;
        setData((prev) => ({
            ...prev,
            models: prev.models.map((model) =>
                model.id === modelId
                    ? {
                        ...model,
                        subItems: model.subItems.map((subItem) =>
                            subItem.id === subItemId ? { ...subItem, name: value } : subItem
                        )
                    }
                    : model
            )
        }));
    };

    const handleHardwareChange = (hardwareId: string, field: 'vendor' | 'specificModel', value: string) => {
        if (!isAdmin) return;
        setData((prev) => ({
            ...prev,
            hardwares: prev.hardwares.map((item) => (item.id === hardwareId ? { ...item, [field]: value } : item))
        }));
    };

    const toggleRowExpanded = (modelId: string) => {
        setExpandedRowIds((prev) => {
            const next = new Set(prev);
            if (next.has(modelId)) {
                next.delete(modelId);
            } else {
                next.add(modelId);
            }
            return next;
        });
    };

    const addSubItem = (modelId: string) => {
        if (!isAdmin) return;

        const subItemId = createId('s');

        setData((prev) => {
            const nextMatrix = { ...prev.matrix };
            prev.hardwares.forEach((hardware) => {
                nextMatrix[getCellKey(subItemId, hardware.id)] = '规划中';
            });

            return {
                ...prev,
                models: prev.models.map((model) =>
                    model.id === modelId
                        ? {
                            ...model,
                            subItems: [...model.subItems, { id: subItemId, name: '' }]
                        }
                        : model
                ),
                matrix: nextMatrix
            };
        });

        setExpandedRowIds((prev) => {
            const next = new Set(prev);
            next.add(modelId);
            return next;
        });
    };

    const handleDeleteSubItem = (rowId: string, subItemId: string) => {
        if (!isAdmin) return;

        setData((prev) => {
            const targetModel = prev.models.find((model) => model.id === rowId);
            if (!targetModel) {
                return prev;
            }

            const nextMatrix = { ...prev.matrix };
            prev.hardwares.forEach((hardware) => {
                delete nextMatrix[getCellKey(subItemId, hardware.id)];
            });

            return {
                ...prev,
                models: prev.models.map((model) =>
                    model.id === rowId
                        ? { ...model, subItems: model.subItems.filter((subItem) => subItem.id !== subItemId) }
                        : model
                ),
                matrix: nextMatrix
            };
        });
    };

    const addModel = () => {
        const trimmedName = newModelName.trim();
        if (!trimmedName || !isAdmin) return;

        const modelId = createId('m');
        const subItemId = `${modelId}-sub1`;

        setData((prev) => {
            const nextMatrix = { ...prev.matrix };

            prev.hardwares.forEach((hardware) => {
                nextMatrix[getCellKey(modelId, hardware.id)] = '规划中';
                nextMatrix[getCellKey(subItemId, hardware.id)] = '规划中';
            });

            return {
                ...prev,
                models: [
                    ...prev.models,
                    {
                        id: modelId,
                        name: trimmedName,
                        description: newModelDescription.trim(),
                        subItems: [{ id: subItemId, name: DEFAULT_SUB_ITEM_NAME }]
                    }
                ],
                matrix: nextMatrix
            };
        });

        setExpandedRowIds((prev) => {
            const next = new Set(prev);
            next.add(modelId);
            return next;
        });

        setNewModelName('');
        setNewModelDescription('');
    };

    const addHardware = () => {
        const trimmedVendor = newHardwareVendor.trim();
        if (!trimmedVendor || !isAdmin) return;

        const hardwareId = createId('h');

        setData((prev) => {
            const nextMatrix = { ...prev.matrix };

            prev.models.forEach((model) => {
                nextMatrix[getCellKey(model.id, hardwareId)] = '规划中';
                model.subItems.forEach((subItem) => {
                    nextMatrix[getCellKey(subItem.id, hardwareId)] = '规划中';
                });
            });

            return {
                ...prev,
                hardwares: [
                    ...prev.hardwares,
                    {
                        id: hardwareId,
                        vendor: trimmedVendor,
                        specificModel: newHardwareSpecificModel.trim()
                    }
                ],
                matrix: nextMatrix
            };
        });

        setNewHardwareVendor('');
        setNewHardwareSpecificModel('');
    };

    const removeModel = (modelId: string) => {
        if (!isAdmin) return;

        setData((prev) => {
            const target = prev.models.find((model) => model.id === modelId);
            const nextMatrix = { ...prev.matrix };

            if (target) {
                prev.hardwares.forEach((hardware) => {
                    delete nextMatrix[getCellKey(modelId, hardware.id)];
                    target.subItems.forEach((subItem) => {
                        delete nextMatrix[getCellKey(subItem.id, hardware.id)];
                    });
                });
            }

            return {
                ...prev,
                models: prev.models.filter((model) => model.id !== modelId),
                matrix: nextMatrix
            };
        });

        setExpandedRowIds((prev) => {
            if (!prev.has(modelId)) return prev;
            const next = new Set(prev);
            next.delete(modelId);
            return next;
        });
    };

    const removeHardware = (hardwareId: string) => {
        if (!isAdmin) return;

        setData((prev) => {
            const nextMatrix = { ...prev.matrix };
            prev.models.forEach((model) => {
                delete nextMatrix[getCellKey(model.id, hardwareId)];
                model.subItems.forEach((subItem) => {
                    delete nextMatrix[getCellKey(subItem.id, hardwareId)];
                });
            });

            return {
                ...prev,
                hardwares: prev.hardwares.filter((hardware) => hardware.id !== hardwareId),
                matrix: nextMatrix
            };
        });
    };

    const query = searchQuery.trim().toLowerCase();

    const matchedRows = useMemo(
        () =>
            data.models.filter((model) => {
                const modelMatched =
                    model.name.toLowerCase().includes(query) || model.description.toLowerCase().includes(query);
                const subItemMatched = model.subItems.some((subItem) => subItem.name.toLowerCase().includes(query));
                return modelMatched || subItemMatched;
            }),
        [data.models, query]
    );

    const matchedCols = useMemo(
        () =>
            data.hardwares.filter(
                (hardware) =>
                    hardware.vendor.toLowerCase().includes(query) ||
                    hardware.specificModel.toLowerCase().includes(query)
            ),
        [data.hardwares, query]
    );

    const { visibleRows, visibleCols } = useMemo(() => {
        let rows = data.models;
        let cols = data.hardwares;

        if (query) {
            const hasRowMatch = matchedRows.length > 0;
            const hasColMatch = matchedCols.length > 0;

            if (hasRowMatch && !hasColMatch) {
                rows = matchedRows;
            } else if (!hasRowMatch && hasColMatch) {
                cols = matchedCols;
            } else if (hasRowMatch && hasColMatch) {
                rows = matchedRows;
                cols = matchedCols;
            } else {
                rows = [];
                cols = [];
            }
        }

        return {
            visibleRows: rows,
            visibleCols: cols
        };
    }, [data.hardwares, data.models, matchedCols, matchedRows, query]);

    const autoExpandedRowIds = useMemo(() => {
        if (!query) return new Set<string>();

        const ids = new Set<string>();
        visibleRows.forEach((model) => {
            if (model.subItems.some((subItem) => subItem.name.toLowerCase().includes(query))) {
                ids.add(model.id);
            }
        });

        return ids;
    }, [query, visibleRows]);

    const effectiveExpandedRowIds = useMemo(() => {
        if (autoExpandedRowIds.size === 0) {
            return expandedRowIds;
        }

        const merged = new Set(expandedRowIds);
        autoExpandedRowIds.forEach((rowId) => merged.add(rowId));
        return merged;
    }, [autoExpandedRowIds, expandedRowIds]);

    const getVisibleSubItems = (model: ModelItem): SubItem[] => {
        if (!query) {
            return model.subItems;
        }

        const modelMatched =
            model.name.toLowerCase().includes(query) || model.description.toLowerCase().includes(query);

        if (modelMatched) {
            return model.subItems;
        }

        const matchedSubItems = model.subItems.filter((subItem) =>
            subItem.name.toLowerCase().includes(query)
        );

        return matchedSubItems.length > 0 ? matchedSubItems : model.subItems;
    };

    return (
        <div className="w-full glass-panel overflow-hidden">
            <div className="p-6 border-b border-border-subtle/50 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">ERNIE/PaddlePaddle 硬件适配矩阵</h2>
                        <p className="text-[var(--color-text-secondary)] text-sm mt-1">支持动态行列增删、交叉状态编辑与本地持久化</p>
                    </div>

                    <div className="relative shrink-0">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="搜索模型框架、子项能力或硬件型号..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-full text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                        />
                    </div>
                </div>

                {isAdmin && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300 transform-gpu">
                        <div className="rounded-xl border border-border-subtle/60 p-3 bg-white/60 space-y-2">
                            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">新增模型行</p>
                            <input
                                value={newModelName}
                                onChange={(event) => setNewModelName(event.target.value)}
                                placeholder="模型/框架名称，例如：文心一言 5.0"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                            />
                            <input
                                value={newModelDescription}
                                onChange={(event) => setNewModelDescription(event.target.value)}
                                placeholder="模型描述（可选）"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                            />
                            <button
                                type="button"
                                onClick={addModel}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                            >
                                <Plus className="w-4 h-4" /> 新增模型
                            </button>
                        </div>

                        <div className="rounded-xl border border-border-subtle/60 p-3 bg-white/60 space-y-2">
                            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">新增硬件列</p>
                            <input
                                value={newHardwareVendor}
                                onChange={(event) => setNewHardwareVendor(event.target.value)}
                                placeholder="硬件厂商名称，例如：Intel"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                            />
                            <input
                                value={newHardwareSpecificModel}
                                onChange={(event) => setNewHardwareSpecificModel(event.target.value)}
                                placeholder="具体型号（可选）"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                            />
                            <button
                                type="button"
                                onClick={addHardware}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                            >
                                <Plus className="w-4 h-4" /> 新增硬件
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {visibleRows.length === 0 || visibleCols.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white/50 border-t border-border-subtle/50 min-h-[400px]">
                    <Search className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">
                        {query ? `未找到包含 '${searchQuery}' 的适配记录` : '暂无适配记录'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar border-t border-border-subtle/50 relative">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-50">
                                <th className="p-4 font-semibold text-sm text-[var(--color-text-secondary)] border-b border-border-subtle/50 min-w-[280px] w-[280px] align-top bg-gray-50 border-r shrink-0">
                                    模型 / 框架
                                </th>
                                {visibleCols.map((hardware) => (
                                    <th key={hardware.id} className="p-4 font-semibold text-sm text-gray-900 border-b border-border-subtle/50 min-w-[240px] w-[240px] whitespace-nowrap align-top bg-gray-50 shrink-0 transition-all">
                                        <div className="flex flex-col gap-2">
                                            {isAdmin ? (
                                                <>
                                                    <input
                                                        value={hardware.vendor}
                                                        onChange={(event) => handleHardwareChange(hardware.id, 'vendor', event.target.value)}
                                                        placeholder="硬件厂商"
                                                        className="w-full shrink-0 px-2 py-1.5 rounded-md border border-gray-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                                                    />
                                                    <input
                                                        value={hardware.specificModel}
                                                        onChange={(event) => handleHardwareChange(hardware.id, 'specificModel', event.target.value)}
                                                        placeholder="具体型号（可选）"
                                                        className="w-full shrink-0 px-2 py-1.5 rounded-md border border-gray-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeHardware(hardware.id)}
                                                        className="shrink-0 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors animate-in fade-in"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />删除列
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="px-1 py-1">
                                                    <span className="block text-sm font-bold text-gray-900">{hardware.vendor}</span>
                                                    {hardware.specificModel && <span className="block text-xs text-gray-500 mt-0.5">{hardware.specificModel}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border-subtle/30">
                            {visibleRows.map((model) => {
                                const visibleSubItems = getVisibleSubItems(model);
                                const isExpanded = effectiveExpandedRowIds.has(model.id);
                                const canExpand = model.subItems.length > 0 || isAdmin;

                                return (
                                    <React.Fragment key={model.id}>
                                        <tr className="hover:bg-blue-50/20 transition-colors group">
                                            <td className="p-4 align-top min-w-[280px] w-[280px] border-r border-border-subtle/30 transition-colors group-hover:bg-blue-50/20 shrink-0">
                                                <div className="flex items-start gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRowExpanded(model.id)}
                                                        disabled={!canExpand}
                                                        className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                                                            canExpand
                                                                ? 'text-gray-500 hover:bg-gray-100'
                                                                : 'text-gray-300 cursor-not-allowed'
                                                        }`}
                                                        aria-label={`${isExpanded ? '折叠' : '展开'}${model.name}子项`}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                    </button>

                                                    <div className="flex-1 flex flex-col gap-2">
                                                        {isAdmin ? (
                                                            <>
                                                                <input
                                                                    value={model.name}
                                                                    onChange={(event) => handleModelChange(model.id, 'name', event.target.value)}
                                                                    className="w-full px-2 py-1.5 rounded-md border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                                                                />
                                                                <input
                                                                    value={model.description}
                                                                    onChange={(event) => handleModelChange(model.id, 'description', event.target.value)}
                                                                    placeholder="描述（可选）"
                                                                    className="w-full shrink-0 px-2 py-1.5 rounded-md border border-gray-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                                                                />
                                                                <span className="text-xs text-gray-500">能力子项：{model.subItems.length}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeModel(model.id)}
                                                                    className="shrink-0 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors animate-in fade-in"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />删除行
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="px-1 py-1">
                                                                <span className="block text-sm font-bold text-gray-900">{model.name}</span>
                                                                {model.description && <span className="block text-xs text-gray-500 mt-1 line-clamp-2">{model.description}</span>}
                                                                <span className="block text-xs text-gray-400 mt-1">能力子项：{model.subItems.length}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {visibleCols.map((hardware) => {
                                                const aggregateStatus = getParentAggregateStatus(model, hardware.id, data.matrix);
                                                return (
                                                    <td key={hardware.id} className="p-4 align-top min-w-[240px] w-[240px] shrink-0">
                                                        <span className={`inline-flex px-3 py-1.5 rounded-lg border text-xs font-bold leading-none select-none transition-colors ${PARENT_STATUS_CLASS_MAP[aggregateStatus]}`}>
                                                            {aggregateStatus}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        {isExpanded &&
                                            visibleSubItems.map((subItem) => (
                                                <tr key={subItem.id} className="group/sub-row bg-white hover:bg-blue-50/10 transition-colors">
                                                    <td className="p-4 align-top min-w-[280px] w-[280px] border-r border-border-subtle/20 shrink-0">
                                                        <div className="relative pl-8">
                                                            <span className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
                                                            <div className="relative flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                                                                {isAdmin ? (
                                                                    <>
                                                                        <input
                                                                            value={subItem.name}
                                                                            onChange={(event) =>
                                                                                handleSubItemNameChange(model.id, subItem.id, event.target.value)
                                                                            }
                                                                            placeholder="子项能力名称，例如：SFT - LoRA"
                                                                            className="flex-1 px-2 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                handleDeleteSubItem(model.id, subItem.id);
                                                                            }}
                                                                            aria-label={`删除 ${subItem.name || '能力子项'}`}
                                                                            className="ml-1 inline-flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer transition-colors w-3.5 h-3.5 shrink-0 opacity-0 group-hover/sub-row:opacity-100 focus-visible:opacity-100"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500">
                                                                        {subItem.name || '未命名能力子项'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {visibleCols.map((hardware) => {
                                                        const cellKey = getCellKey(subItem.id, hardware.id);
                                                        const status = resolveStatus(data.matrix, subItem.id, hardware.id);
                                                        const statusClass = statusClassByKey[cellKey] || STATUS_CLASS_MAP['规划中'];

                                                        return (
                                                            <td key={hardware.id} className="p-4 align-top min-w-[240px] w-[240px] shrink-0">
                                                                {isAdmin ? (
                                                                    <select
                                                                        value={status}
                                                                        onChange={(event) =>
                                                                            handleCellStatusChange(
                                                                                subItem.id,
                                                                                hardware.id,
                                                                                event.target.value as CellStatus
                                                                            )
                                                                        }
                                                                        className={`w-full px-3 py-2 rounded-lg border text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200 transition-colors cursor-pointer ${statusClass}`}
                                                                    >
                                                                        {STATUS_OPTIONS.map((option) => (
                                                                            <option key={option} value={option}>
                                                                                {option}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span className={`inline-flex px-3 py-1.5 rounded-lg border text-xs font-bold leading-none select-none transition-colors ${statusClass}`}>
                                                                        {status}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}

                                        {isExpanded && isAdmin && (
                                            <tr className="bg-white/60">
                                                <td className="p-4 align-top min-w-[280px] w-[280px] border-r border-border-subtle/20 shrink-0">
                                                    <div className="pl-8">
                                                        <button
                                                            type="button"
                                                            onClick={() => addSubItem(model.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" /> 添加能力子项
                                                        </button>
                                                    </div>
                                                </td>
                                                {visibleCols.map((hardware) => (
                                                    <td key={hardware.id} className="p-4 align-top min-w-[240px] w-[240px] shrink-0" />
                                                ))}
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
