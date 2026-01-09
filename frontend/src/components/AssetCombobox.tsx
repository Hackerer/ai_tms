import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { SearchCode } from 'lucide-react';
import { cn } from '../lib/utils';
import type { AssetItem } from './AssetLibrarySidebar';

interface AssetComboboxProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (assets: AssetItem[]) => void;
    availableAssets: AssetItem[];
    searchQuery: string; // 外部传入的搜索关键词
    onSearchChange: (value: string) => void; // 搜索框变化回调
}

export const AssetCombobox = ({
    open,
    onOpenChange,
    onSelect,
    availableAssets,
    searchQuery,
    onSearchChange
}: AssetComboboxProps) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const popoverRef = useRef<HTMLDivElement>(null);

    // 实时过滤资产
    const filteredAssets = availableAssets.filter(asset => {
        const query = searchQuery.toLowerCase();
        return (
            asset.name.toLowerCase().includes(query) ||
            asset.id.toLowerCase().includes(query) ||
            asset.page?.toLowerCase().includes(query)
        );
    });

    // 重置状态（不重置searchQuery，由外部管理）
    useEffect(() => {
        if (!open) {
            setSelectedIds(new Set());
            setHighlightedIndex(0);
        }
    }, [open]);

    // 键盘导航
    const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'Escape':
                onOpenChange(false);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    Math.min(prev + 1, filteredAssets.length - 1)
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case ' ':
                // 空格键仅在非输入框时切换选中状态
                e.preventDefault();
                toggleHighlighted();
                break;
            case 'Enter':
                if (selectedIds.size > 0) {
                    handleAddSelected();
                }
                break;
        }
    };

    // 切换高亮项的选中状态
    const toggleHighlighted = () => {
        if (filteredAssets[highlightedIndex]) {
            toggleSelect(filteredAssets[highlightedIndex].id);
        }
    };

    // 切换选中状态
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // 批量添加
    const handleAddSelected = () => {
        const selectedAssets = availableAssets.filter(asset =>
            selectedIds.has(asset.id)
        );
        onSelect(selectedAssets);
        onOpenChange(false);
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop虚化背景 */}
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-150"
                onClick={() => onOpenChange(false)}
            />

            {/* Popover主体 - 向上偏移让内部搜索框与底部对齐 */}
            <div
                ref={popoverRef}
                className="absolute -top-[42px] left-0 w-full z-50 animate-in slide-in-from-top-2 duration-200"
                onKeyDown={handleKeyDown}
            >
                <div className="card-standard p-0 overflow-hidden max-w-3xl">
                    {/* 内部搜索框 - 与底部搜索框像素对齐 */}
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                            <SearchCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="搜索事件名或页面..."
                                className="w-full pl-10 pr-4 py-2 bg-surface-container border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                                autoFocus
                            />
                        </div>
                    </div>
                    {/* 结果列表 */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {filteredAssets.length > 0 ? (
                            filteredAssets.map((asset, index) => {
                                const isSelected = selectedIds.has(asset.id);
                                const isHighlighted = index === highlightedIndex;

                                return (
                                    <label
                                        key={asset.id}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/30 last:border-0",
                                            isHighlighted && "bg-muted/5",
                                            isSelected && "bg-primary/10"
                                        )}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(asset.id)}
                                            className="cursor-pointer rounded border border-border bg-muted/10 text-primary focus:ring-primary/50 accent-primary w-4 h-4"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-mono font-bold text-sm text-foreground truncate">
                                                {asset.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {asset.id} · {asset.page}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded border border-border">
                                            {asset.params} 参数
                                        </span>
                                    </label>
                                );
                            })
                        ) : (
                            <div className="py-16 text-center">
                                <p className="text-muted-foreground/50 text-sm font-medium">
                                    {searchQuery ? '未找到匹配的资产' : '暂无可用资产'}
                                </p>
                                <p className="text-muted-foreground/30 text-xs mt-1">
                                    {searchQuery && '尝试使用不同的关键词搜索'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer批量操作 */}
                    {filteredAssets.length > 0 && (
                        <div className="p-4 border-t border-border bg-muted/5 flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                {selectedIds.size > 0 ? (
                                    <>已选择 <span className="font-bold text-primary">{selectedIds.size}</span> 项</>
                                ) : (
                                    <>共 {filteredAssets.length} 项可用</>
                                )}
                            </span>
                            <button
                                onClick={handleAddSelected}
                                disabled={selectedIds.size === 0}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    selectedIds.size > 0
                                        ? "bg-primary text-primary-foreground hover:brightness-110"
                                        : "bg-muted/20 text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                添加 {selectedIds.size > 0 && `${selectedIds.size} 项`} →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
