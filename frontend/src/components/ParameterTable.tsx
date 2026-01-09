import { useState } from 'react';
import { Plus, Trash2, Link } from 'lucide-react';
import { cn } from '../lib/utils';
import type { WorkflowParameter as Parameter } from '../types/workflow';

export interface ParameterTableProps {
    params: Parameter[];
    eventIndex: number;
    isReadOnly: boolean;
    onParamChange: (eventIdx: number, paramIdx: number, field: keyof Parameter, value: any) => void;
    onParamAdd: (eventIdx: number) => void;
    onParamDelete: (eventIdx: number, paramIdx: number) => void;
}

const DATA_TYPES = ['String', 'Number', 'Boolean', 'Object', 'Array'];

export const ParameterTable = ({ params, eventIndex, isReadOnly, onParamChange, onParamAdd, onParamDelete }: ParameterTableProps) => {
    const [editingCell, setEditingCell] = useState<{ paramIdx: number; field: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const startEdit = (paramIdx: number, field: string, currentValue: any) => {
        setEditingCell({ paramIdx, field });
        setEditValue(String(currentValue));
    };

    const saveEdit = () => {
        if (editingCell) {
            const field = editingCell.field as keyof Parameter;
            const value: any = editValue;

            if (field === 'key') {
                if (!/^[a-z_][a-z0-9_]*$/.test(editValue)) {
                    alert('参数名只能包含小写字母、数字和下划线,且必须以字母或下划线开头');
                    return;
                }
            }

            onParamChange(eventIndex, editingCell.paramIdx, field, value);
            setEditingCell(null);
        }
    };

    const cancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    return (
        <div className="mx-6 mb-4 p-4 rounded-xl bg-surface-container border border-border shadow-sm">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-border">
                        <th className="pb-2 text-[10px] font-bold uppercase text-muted-foreground w-[25%] tracking-wide">
                            参数键名 (Key)
                        </th>
                        <th className="pb-2 text-[10px] font-bold uppercase text-muted-foreground w-[15%] tracking-wide">
                            数据类型
                        </th>
                        <th className="pb-2 text-[10px] font-bold uppercase text-muted-foreground w-[35%] tracking-wide">
                            含义说明
                        </th>
                        <th className="pb-2 text-[10px] font-bold uppercase text-muted-foreground w-[15%] text-center tracking-wide">
                            必填
                        </th>
                        <th className="pb-2 w-[10%]"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {params.map((p, i) => {
                        const isReferenced = !!p.ref_id;
                        return (
                            <tr key={i} className="group hover:bg-muted/5 transition-colors">
                                <td className="py-2.5 text-xs font-mono relative">
                                    <div className="flex items-center gap-2">
                                        {isReferenced && (
                                            <div className="group/ref relative" title={p.category === 'global' ? '引用自公共参数池' : '引用自业务参数池'}>
                                                <Link className={cn(
                                                    "w-3 h-3",
                                                    p.category === 'global' ? "text-blue-500" : "text-purple-500"
                                                )} />
                                            </div>
                                        )}

                                        {!isReadOnly && !isReferenced && editingCell?.paramIdx === i && editingCell?.field === 'key' ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={saveEdit}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit();
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                                autoFocus
                                                className="w-full bg-surface-container border border-primary/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                                            />
                                        ) : (
                                            <span
                                                onClick={() => !isReadOnly && !isReferenced && startEdit(i, 'key', p.key)}
                                                className={cn(
                                                    "font-medium transition-colors",
                                                    !isReadOnly && !isReferenced ? 'cursor-pointer hover:text-primary' : '',
                                                    isReferenced ? 'text-muted-foreground/50' : 'text-foreground/90'
                                                )}
                                            >
                                                {p.key}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-2.5">
                                    {!isReadOnly && !isReferenced && editingCell?.paramIdx === i && editingCell?.field === 'type' ? (
                                        <select
                                            value={editValue}
                                            onChange={(e) => {
                                                setEditValue(e.target.value);
                                                onParamChange(eventIndex, i, 'type', e.target.value);
                                                setEditingCell(null);
                                            }}
                                            autoFocus
                                            className="bg-surface-container border border-primary/30 rounded px-2 py-1 text-[10px] font-bold uppercase focus:outline-none focus:border-primary text-foreground"
                                        >
                                            {DATA_TYPES.map(type => (
                                                <option key={type} value={type} className="bg-background">{type}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span
                                            onClick={() => !isReadOnly && !isReferenced && startEdit(i, 'type', p.type)}
                                            className={cn(
                                                "text-[10px] px-2 py-0.5 rounded border font-bold uppercase inline-block",
                                                p.type === 'String' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                                p.type === 'Number' && "bg-green-500/10 text-green-400 border-green-500/20",
                                                p.type === 'Boolean' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                                                p.type === 'Object' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                                                p.type === 'Array' && "bg-pink-500/10 text-pink-400 border-pink-500/20",
                                                !isReadOnly && !isReferenced && "cursor-pointer hover:brightness-125 transition-all",
                                                isReferenced && "opacity-50"
                                            )}
                                        >
                                            {p.type}
                                        </span>
                                    )}
                                </td>
                                <td className="py-2.5 text-xs text-muted-foreground">
                                    {!isReadOnly && !isReferenced && editingCell?.paramIdx === i && editingCell?.field === 'desc' ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={saveEdit}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit();
                                                if (e.key === 'Escape') cancelEdit();
                                            }}
                                            autoFocus
                                            className="w-full bg-surface-container border border-primary/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all text-foreground"
                                        />
                                    ) : (
                                        <span
                                            onClick={() => !isReadOnly && !isReferenced && startEdit(i, 'desc', p.desc)}
                                            className={cn(
                                                "transition-colors",
                                                !isReadOnly && !isReferenced ? 'cursor-pointer hover:text-foreground' : '',
                                                isReferenced ? 'italic opacity-40' : 'opacity-80'
                                            )}
                                        >
                                            {p.desc}
                                        </span>
                                    )}
                                </td>
                                <td className="py-2.5 text-center">
                                    <div
                                        onClick={() => !isReadOnly && onParamChange(eventIndex, i, 'isRequired', !p.isRequired)}
                                        className={cn(
                                            "w-2 h-2 rounded-full mx-auto transition-all",
                                            p.isRequired ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" : "bg-muted/10",
                                            !isReadOnly && "cursor-pointer hover:scale-125"
                                        )}
                                        title={p.isRequired ? "Required" : "Optional"}
                                    />
                                </td>
                                <td className="py-2.5 text-right">
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => onParamDelete(eventIndex, i)}
                                            className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-md"
                                            title="Remove parameter"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400 transition-colors" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {!isReadOnly && (
                        <tr className="bg-muted/5">
                            <td colSpan={5} className="py-2 px-4">
                                <button
                                    onClick={() => onParamAdd(eventIndex)}
                                    className="text-[10px] font-bold text-primary flex items-center gap-1.5 hover:text-primary/80 transition-colors py-1 uppercase tracking-wider"
                                >
                                    <Plus className="w-3.5 h-3.5" /> 引用或新建字段 (Add Field)
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
