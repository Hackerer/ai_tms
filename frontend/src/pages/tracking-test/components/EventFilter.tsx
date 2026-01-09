import React, { useState, useMemo } from 'react';
import { Filter, X, Check, Search, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface EventFilterProps {
    availableEventNames: string[];
    availableEventTypes: string[];
    onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
    query: string;
    selectedNames: string[];
    selectedTypes: string[];
    isExcludeMode: boolean; // 反选模式
}

export const EventFilter: React.FC<EventFilterProps> = ({
    availableEventNames,
    availableEventTypes,
    onFilterChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [state, setState] = useState<FilterState>({
        query: '',
        selectedNames: [],
        selectedTypes: [],
        isExcludeMode: false
    });

    // 触发更新
    const updateState = (newState: Partial<FilterState>) => {
        const next = { ...state, ...newState };
        setState(next);
        onFilterChange(next);
    };

    const toggleSelection = (list: string[], item: string, key: 'selectedNames' | 'selectedTypes') => {
        const nextList = list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
        updateState({ [key]: nextList });
    };

    const hasActiveFilters = state.selectedNames.length > 0 || state.selectedTypes.length > 0 || state.query !== '';

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="搜索事件名..."
                        value={state.query}
                        onChange={(e) => updateState({ query: e.target.value })}
                        className="w-full bg-surface-container-high/50 border border-border/50 rounded-xl pl-9 pr-4 py-1.5 text-xs font-bold focus:outline-none focus:border-primary/50 focus:bg-surface-container transition-all"
                    />
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border transition-all",
                        isOpen || hasActiveFilters
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-surface-container-high/50 border-border/50 text-muted-foreground hover:bg-surface-container"
                    )}
                >
                    <Filter className="w-3.5 h-3.5" />
                    筛选
                    {hasActiveFilters && (
                        <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                            {(state.selectedNames.length + state.selectedTypes.length) || "!"}
                        </span>
                    )}
                </button>
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest border border-border shadow-2xl rounded-2xl z-50 p-5 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-6">
                            {/* Mode Toggle: 正选/反选 */}
                            <div>
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-3 pl-1">过滤模式</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-xl border border-border/50">
                                    <button
                                        onClick={() => updateState({ isExcludeMode: false })}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-black transition-all",
                                            !state.isExcludeMode ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        正选 (包含)
                                    </button>
                                    <button
                                        onClick={() => updateState({ isExcludeMode: true })}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-black transition-all",
                                            state.isExcludeMode ? "bg-background text-destructive shadow-sm" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <EyeOff className="w-3.5 h-3.5" />
                                        反选 (排除)
                                    </button>
                                </div>
                            </div>

                            {/* Event Names Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3 pl-1">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">事件名称</label>
                                    {state.selectedNames.length > 0 && (
                                        <button
                                            onClick={() => updateState({ selectedNames: [] })}
                                            className="text-[10px] text-primary font-black hover:underline"
                                        >
                                            清空
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-32 overflow-auto space-y-1 pr-1 custom-scrollbar">
                                    {availableEventNames.map(name => (
                                        <button
                                            key={name}
                                            onClick={() => toggleSelection(state.selectedNames, name, 'selectedNames')}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                                                state.selectedNames.includes(name)
                                                    ? "bg-primary/10 border-primary/20 text-primary"
                                                    : "hover:bg-muted/5 border-transparent text-muted-foreground"
                                            )}
                                        >
                                            {name}
                                            {state.selectedNames.includes(name) && <Check className="w-3 h-3" />}
                                        </button>
                                    ))}
                                    {availableEventNames.length === 0 && (
                                        <p className="text-[10px] text-muted-foreground italic text-center py-4 opacity-50">暂无可筛选事件</p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-2 border-t border-border flex items-center justify-between">
                                <button
                                    onClick={() => {
                                        const reset = { query: '', selectedNames: [], selectedTypes: [], isExcludeMode: false };
                                        setState(reset);
                                        onFilterChange(reset);
                                        setIsOpen(false);
                                    }}
                                    className="text-xs font-black text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    重置所有
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 bg-foreground text-background rounded-xl text-xs font-black hover:opacity-90 transition-all"
                                >
                                    完成
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
