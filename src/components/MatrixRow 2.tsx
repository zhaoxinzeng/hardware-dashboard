import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';

export type CellStatus = '已跑通' | '适配中' | '规划中';

export const STATUS_OPTIONS: CellStatus[] = ['已跑通', '适配中', '规划中'];

export const STATUS_CLASS_MAP: Record<CellStatus, string> = {
    已跑通: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    适配中: 'bg-amber-50 text-amber-700 border-amber-200',
    规划中: 'bg-slate-50 text-slate-600 border-slate-200',
};

export type MatrixSubItem = {
    id: string;
    name: string;
};

export type MatrixRowItem = {
    id: string;
    name: string;
    subItems: MatrixSubItem[];
};

export type HardwareItem = {
    id: string;
    vendor: string;
    specificModel: string;
};

interface Props {
    row: MatrixRowItem;
    columns: HardwareItem[];
    matrix: Record<string, CellStatus>;
    isAdmin: boolean;
    forceExpanded?: boolean; // driven by search
    onCellChange: (itemId: string, hardwareId: string, status: CellStatus) => void;
    onAddSubItem: (modelId: string) => void;
    onDeleteSubItem?: (rowId: string, subItemId: string) => void;
}

const getCellKey = (itemId: string, hardwareId: string) => `${itemId}_${hardwareId}`;

const getAggregateStatus = (
    subItems: MatrixSubItem[],
    hardwareId: string,
    matrix: Record<string, CellStatus>
): string => {
    if (subItems.length === 0) return '–';
    const statuses = subItems.map(s => matrix[getCellKey(s.id, hardwareId)] ?? '规划中');
    if (statuses.every(s => s === '已跑通')) return '全面适配';
    if (statuses.some(s => s === '已跑通' || s === '适配中')) return '部分适配';
    return '未适配';
};

const AGGREGATE_CLASS_MAP: Record<string, string> = {
    全面适配: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    部分适配: 'bg-amber-50 text-amber-700 border-amber-200',
    未适配: 'bg-slate-50 text-slate-600 border-slate-200',
    '–': 'text-gray-400 border-gray-100 bg-white',
};

export const MatrixRow: React.FC<Props> = ({
    row,
    columns,
    matrix,
    isAdmin,
    forceExpanded = false,
    onCellChange,
    onAddSubItem,
    onDeleteSubItem,
}) => {
    const [isExpandedLocal, setIsExpandedLocal] = useState(false);
    const isExpanded = forceExpanded || isExpandedLocal;

    return (
        <>
            {/* Parent Row */}
            <tr
                className="hover:bg-blue-50/30 transition-colors group cursor-pointer bg-gray-50/60"
                onClick={() => setIsExpandedLocal(prev => !prev)}
            >
                <td className="p-4 align-middle min-w-[280px] w-[280px] border-r border-border-subtle/30 shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setIsExpandedLocal(prev => !prev); }}
                        >
                            {isExpanded
                                ? <ChevronDown className="w-4 h-4" />
                                : <ChevronRight className="w-4 h-4" />
                            }
                        </button>
                        <span className="text-sm font-bold text-gray-900">{row.name}</span>
                        <span className="ml-auto shrink-0 text-xs text-gray-400 font-medium">{row.subItems.length} 项</span>
                    </div>
                </td>
                {columns.map(hw => {
                    const agg = getAggregateStatus(row.subItems, hw.id, matrix);
                    const cls = AGGREGATE_CLASS_MAP[agg] ?? AGGREGATE_CLASS_MAP['–'];
                    return (
                        <td key={hw.id} className="p-4 align-middle min-w-[240px] w-[240px] shrink-0" onClick={e => e.stopPropagation()}>
                            <span className={`inline-flex px-3 py-1.5 rounded-lg border text-xs font-bold leading-none select-none ${cls}`}>
                                {agg}
                            </span>
                        </td>
                    );
                })}
            </tr>

            {/* Child Rows */}
            {isExpanded && row.subItems.map((sub) => (
                <tr key={sub.id} className="group/sub-row hover:bg-blue-50/10 transition-colors border-t border-dashed border-gray-200/60">
                    <td className="pl-10 pr-4 py-3 align-middle min-w-[280px] w-[280px] border-r border-border-subtle/30 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                            <span className="text-sm text-gray-500">{sub.name}</span>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSubItem?.(row.id, sub.id);
                                    }}
                                    aria-label={`删除 ${sub.name}`}
                                    className="ml-2 inline-flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer transition-colors w-3.5 h-3.5 opacity-0 group-hover/sub-row:opacity-100 focus-visible:opacity-100"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </td>
                    {columns.map(hw => {
                        const cellKey = getCellKey(sub.id, hw.id);
                        const status = matrix[cellKey] ?? '规划中';
                        const statusClass = STATUS_CLASS_MAP[status];
                        return (
                            <td key={hw.id} className="p-4 align-middle min-w-[240px] w-[240px] shrink-0">
                                {isAdmin ? (
                                    <select
                                        value={status}
                                        onChange={e => onCellChange(sub.id, hw.id, e.target.value as CellStatus)}
                                        className={`w-full px-3 py-2 rounded-lg border text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer transition-colors ${statusClass}`}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className={`inline-flex px-3 py-1.5 rounded-lg border text-xs font-bold leading-none select-none ${statusClass}`}>
                                        {status}
                                    </span>
                                )}
                            </td>
                        );
                    })}
                </tr>
            ))}

            {/* Admin: Add sub-item row */}
            {isExpanded && isAdmin && (
                <tr className="border-t border-dashed border-gray-200/60">
                    <td colSpan={columns.length + 1} className="pl-10 py-2">
                        <button
                            type="button"
                            onClick={() => onAddSubItem(row.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-blue-500 border border-dashed border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> 添加能力子项
                        </button>
                    </td>
                </tr>
            )}
        </>
    );
};
