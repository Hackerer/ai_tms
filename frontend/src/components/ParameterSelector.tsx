import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { MOCK_PARAMETERS } from '../services/mockData';
import type { Parameter } from '../types/asset';

interface ParameterSelectorProps {
    onSelect: (param: Parameter) => void;
    onCreate: (keyword: string) => void;
    className?: string;
    autoFocus?: boolean;
}

export const ParameterSelector = ({ onSelect, onCreate, className, autoFocus }: ParameterSelectorProps) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [autoFocus]);

    const filteredParams = useMemo(() => {
        if (!query) return MOCK_PARAMETERS.slice(0, 5); // Show top 5 by default
        const lower = query.toLowerCase();
        return MOCK_PARAMETERS.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.description.toLowerCase().includes(lower)
        ).slice(0, 8);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % (filteredParams.length + 1)); // +1 for Create option
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + (filteredParams.length + 1)) % (filteredParams.length + 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex < filteredParams.length) {
                onSelect(filteredParams[selectedIndex]);
            } else {
                onCreate(query);
            }
        }
    };

    return (
        <div className={cn("w-[400px] bg-popover border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col", className)}>
            <div className="p-3 border-b border-border bg-muted/5">
                <div className="flex items-center gap-2 bg-muted/20 border border-border rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="搜索参数库或新建..."
                        className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50 h-5"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] py-2">
                {/* Section Header */}
                <div className="px-4 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{query ? '搜索结果' : '热门参数'}</span>
                    <span className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        系统参数池
                    </span>
                </div>

                {filteredParams.length === 0 && query && (
                    <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                        未找到 "{query}" 相关参数
                    </div>
                )}

                {filteredParams.map((param, index) => (
                    <div
                        key={param.id}
                        onClick={() => onSelect(param)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                            "mx-2 px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between group",
                            index === selectedIndex ? "bg-accent" : "hover:bg-muted/5"
                        )}
                    >
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "font-mono text-sm font-bold truncate",
                                    index === selectedIndex ? "text-primary" : "text-foreground"
                                )}>
                                    {param.name}
                                </span>
                                <span className={cn(
                                    "text-[10px] px-1.5 rounded border border-border bg-muted/10 text-muted-foreground",
                                    param.category === 'global' ? "bg-blue-500/10 text-blue-500 border-blue-500/10" : ""
                                )}>
                                    {param.data_type}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground truncate group-hover:text-foreground/80 transition-colors">
                                {param.description}
                            </span>
                        </div>
                        {index === selectedIndex && (
                            <span className="text-[10px] text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">Enter 选中</span>
                        )}
                    </div>
                ))}

                {/* Create New Option */}
                {query && (
                    <>
                        <div className="h-px bg-border mx-4 my-2" />
                        <div
                            onClick={() => onCreate(query)}
                            onMouseEnter={() => setSelectedIndex(filteredParams.length)}
                            className={cn(
                                "mx-2 px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-3",
                                selectedIndex === filteredParams.length ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-primary hover:bg-muted/5"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                selectedIndex === filteredParams.length ? "bg-white/20" : "bg-primary/10"
                            )}>
                                <Plus className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">新建参数: "{query}"</span>
                                <span className={cn(
                                    "text-xs",
                                    selectedIndex === filteredParams.length ? "text-white/80" : "text-muted-foreground"
                                )}>
                                    点击配置详细信息并存入参数池
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer Tip */}
            <div className="px-4 py-2 border-t border-border bg-muted/5 text-[10px] text-muted-foreground flex justify-between">
                <span>↑↓ 导航</span>
                <span>Enter 确认</span>
            </div>
        </div>
    );
};
