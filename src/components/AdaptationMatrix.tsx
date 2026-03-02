import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'hardware_matrix_data';

type CellStatus = '已跑通' | '适配中' | '规划中';

type ModelItem = {
    id: string;
    name: string;
    description: string;
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

const STATUS_OPTIONS: CellStatus[] = ['已跑通', '适配中', '规划中'];

const STATUS_CLASS_MAP: Record<CellStatus, string> = {
    已跑通: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    适配中: 'bg-amber-50 text-amber-700 border-amber-200',
    规划中: 'bg-slate-50 text-slate-600 border-slate-200'
};

const DEFAULT_MATRIX_DATA: MatrixData = {
    models: [
        { id: 'm1', name: '文心一言 4.0', description: '' },
        { id: 'm2', name: '飞桨 PaddlePaddle', description: '' },
        { id: 'm3', name: '千帆大模型平台', description: '' }
    ],
    hardwares: [
        { id: 'h1', vendor: 'NVIDIA', specificModel: '' },
        { id: 'h2', vendor: '昇腾', specificModel: '' },
        { id: 'h3', vendor: '昆仑芯', specificModel: '' },
        { id: 'h4', vendor: '燧原', specificModel: '' }
    ],
    matrix: {
        m1_h1: '已跑通',
        m1_h2: '已跑通',
        m1_h3: '适配中',
        m1_h4: '规划中',
        m2_h1: '已跑通',
        m2_h2: '已跑通',
        m2_h3: '已跑通',
        m2_h4: '适配中'
    }
};

const LEGACY_STATUS_MAP: Record<string, CellStatus> = {
    ready: '已跑通',
    progress: '适配中',
    planned: '规划中'
};

const getCellKey = (modelId: string, hardwareId: string): string => `${modelId}_${hardwareId}`;

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

const normalizeMatrixData = (rawValue: unknown): MatrixData => {
    if (!isObject(rawValue)) {
        return DEFAULT_MATRIX_DATA;
    }

    const rawModels = Array.isArray(rawValue.models) ? rawValue.models : [];
    const rawHardwares = Array.isArray(rawValue.hardwares) ? rawValue.hardwares : [];
    const rawMatrix = isObject(rawValue.matrix) ? rawValue.matrix : {};

    const models: ModelItem[] = rawModels
        .map((item) => {
            if (!isObject(item)) return null;
            const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : '';
            const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : '';
            if (!id || !name) return null;
            return {
                id,
                name,
                description: typeof item.description === 'string' ? item.description : ''
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
            const key = getCellKey(model.id, hardware.id);
            matrix[key] = normalizeStatus(rawMatrix[key]);
        });
    });

    return { models, hardwares, matrix };
};

const loadInitialMatrixData = (): MatrixData => {
    if (typeof window === 'undefined') {
        return DEFAULT_MATRIX_DATA;
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

const createId = (prefix: 'm' | 'h'): string => {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
};

export const AdaptationMatrix: React.FC = () => {
    const [data, setData] = useState<MatrixData>(() => loadInitialMatrixData());
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
            data.hardwares.forEach((hardware) => {
                const key = getCellKey(model.id, hardware.id);
                classes[key] = STATUS_CLASS_MAP[data.matrix[key] || '规划中'];
            });
        });
        return classes;
    }, [data]);

    const handleCellStatusChange = (modelId: string, hardwareId: string, status: CellStatus) => {
        const key = getCellKey(modelId, hardwareId);
        setData((prev) => ({
            ...prev,
            matrix: {
                ...prev.matrix,
                [key]: status
            }
        }));
    };

    const handleModelChange = (modelId: string, field: 'name' | 'description', value: string) => {
        setData((prev) => ({
            ...prev,
            models: prev.models.map((item) => (
                item.id === modelId ? { ...item, [field]: value } : item
            ))
        }));
    };

    const handleHardwareChange = (hardwareId: string, field: 'vendor' | 'specificModel', value: string) => {
        setData((prev) => ({
            ...prev,
            hardwares: prev.hardwares.map((item) => (
                item.id === hardwareId ? { ...item, [field]: value } : item
            ))
        }));
    };

    const addModel = () => {
        const trimmedName = newModelName.trim();
        if (!trimmedName) return;
        const modelId = createId('m');
        setData((prev) => {
            const nextMatrix = { ...prev.matrix };
            prev.hardwares.forEach((hardware) => {
                nextMatrix[getCellKey(modelId, hardware.id)] = '规划中';
            });
            return {
                ...prev,
                models: [
                    ...prev.models,
                    { id: modelId, name: trimmedName, description: newModelDescription.trim() }
                ],
                matrix: nextMatrix
            };
        });
        setNewModelName('');
        setNewModelDescription('');
    };

    const addHardware = () => {
        const trimmedVendor = newHardwareVendor.trim();
        if (!trimmedVendor) return;
        const hardwareId = createId('h');
        setData((prev) => {
            const nextMatrix = { ...prev.matrix };
            prev.models.forEach((model) => {
                nextMatrix[getCellKey(model.id, hardwareId)] = '规划中';
            });
            return {
                ...prev,
                hardwares: [
                    ...prev.hardwares,
                    { id: hardwareId, vendor: trimmedVendor, specificModel: newHardwareSpecificModel.trim() }
                ],
                matrix: nextMatrix
            };
        });
        setNewHardwareVendor('');
        setNewHardwareSpecificModel('');
    };

    const removeModel = (modelId: string) => {
        setData((prev) => {
            const nextMatrix = { ...prev.matrix };
            prev.hardwares.forEach((hardware) => {
                delete nextMatrix[getCellKey(modelId, hardware.id)];
            });
            return {
                ...prev,
                models: prev.models.filter((model) => model.id !== modelId),
                matrix: nextMatrix
            };
        });
    };

    const removeHardware = (hardwareId: string) => {
        setData((prev) => {
            const nextMatrix = { ...prev.matrix };
            prev.models.forEach((model) => {
                delete nextMatrix[getCellKey(model.id, hardwareId)];
            });
            return {
                ...prev,
                hardwares: prev.hardwares.filter((hardware) => hardware.id !== hardwareId),
                matrix: nextMatrix
            };
        });
    };

    return (
        <div className="w-full glass-panel overflow-hidden">
            <div className="p-6 border-b border-border-subtle/50 space-y-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">ERNIE/PaddlePaddle 硬件适配矩阵</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">支持动态行列增删、交叉状态编辑与本地持久化</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border-subtle/60 p-3 bg-white/60 space-y-2">
                        <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">新增模型行</p>
                        <input
                            value={newModelName}
                            onChange={(event) => setNewModelName(event.target.value)}
                            placeholder="模型/框架名称，例如：文心一言 5.0"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <input
                            value={newModelDescription}
                            onChange={(event) => setNewModelDescription(event.target.value)}
                            placeholder="模型描述（可选）"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <button
                            type="button"
                            onClick={addModel}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            新增模型
                        </button>
                    </div>

                    <div className="rounded-xl border border-border-subtle/60 p-3 bg-white/60 space-y-2">
                        <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">新增硬件列</p>
                        <input
                            value={newHardwareVendor}
                            onChange={(event) => setNewHardwareVendor(event.target.value)}
                            placeholder="硬件厂商名称，例如：Intel"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <input
                            value={newHardwareSpecificModel}
                            onChange={(event) => setNewHardwareSpecificModel(event.target.value)}
                            placeholder="具体型号（可选）"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <button
                            type="button"
                            onClick={addHardware}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            新增硬件
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar border-t border-border-subtle/50 relative">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-50">
                            <th className="p-4 font-semibold text-sm text-[var(--color-text-secondary)] border-b border-border-subtle/50 min-w-[280px] w-[280px] align-top bg-gray-50 border-r shrink-0">
                                模型 / 框架
                            </th>
                            {data.hardwares.map((hardware) => (
                                <th key={hardware.id} className="p-4 font-semibold text-sm text-gray-900 border-b border-border-subtle/50 min-w-[240px] w-[240px] whitespace-nowrap align-top bg-gray-50 shrink-0">
                                    <div className="flex flex-col gap-2">
                                        <input
                                            value={hardware.vendor}
                                            onChange={(event) => handleHardwareChange(hardware.id, 'vendor', event.target.value)}
                                            placeholder="硬件厂商"
                                            className="w-full shrink-0 px-2 py-1.5 rounded-md border border-gray-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                        <input
                                            value={hardware.specificModel}
                                            onChange={(event) => handleHardwareChange(hardware.id, 'specificModel', event.target.value)}
                                            placeholder="具体型号（可选）"
                                            className="w-full shrink-0 px-2 py-1.5 rounded-md border border-gray-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeHardware(hardware.id)}
                                            className="shrink-0 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            删除列
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/30">
                        {data.models.map((model) => (
                            <tr key={model.id} className="hover:bg-blue-50/20 transition-colors group">
                                <td className="p-4 align-top min-w-[280px] w-[280px] border-r border-border-subtle/30 transition-colors group-hover:bg-blue-50/20 shrink-0">
                                    <div className="flex flex-col gap-2">
                                        <input
                                            value={model.name}
                                            onChange={(event) => handleModelChange(model.id, 'name', event.target.value)}
                                            className="w-full px-2 py-1.5 rounded-md border border-gray-200 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                        <input
                                            value={model.description}
                                            onChange={(event) => handleModelChange(model.id, 'description', event.target.value)}
                                            placeholder="描述（可选）"
                                            className="w-full shrink-0 px-2 py-1.5 rounded-md border border-gray-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeModel(model.id)}
                                            className="shrink-0 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            删除行
                                        </button>
                                    </div>
                                </td>
                                {data.hardwares.map((hardware) => {
                                    const cellKey = getCellKey(model.id, hardware.id);
                                    const status = data.matrix[cellKey] || '规划中';
                                    const statusClass = statusClassByKey[cellKey] || STATUS_CLASS_MAP['规划中'];
                                    return (
                                        <td key={hardware.id} className="p-4 align-top min-w-[240px] w-[240px] shrink-0">
                                            <select
                                                value={status}
                                                onChange={(event) => handleCellStatusChange(model.id, hardware.id, event.target.value as CellStatus)}
                                                className={`w-full px-3 py-2 rounded-lg border text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200 ${statusClass}`}
                                            >
                                                {STATUS_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
