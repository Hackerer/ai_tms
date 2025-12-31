import { useState } from 'react';
import { X, SearchCode, FileText } from 'lucide-react';

export interface AssetItem {
    id: string;
    name: string;
    type: string;
    page: string;
    params: number;
}

interface AssetLibrarySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (asset: AssetItem) => void;
}

/**
 * 资产库侧边栏组件
 * 用于从资产库中选择已有埋点事件进行修改
 */
export const AssetLibrarySidebar = ({ isOpen, onClose, onSelect }: AssetLibrarySidebarProps) => {
    const [search, setSearch] = useState('');

    // TODO: 从 assetService 获取数据
    const mockAssets: AssetItem[] = [
        { id: 'EVT-10023', name: 'hot_sale_click', type: 'Click', page: '热销看板', params: 5 },
        { id: 'EVT-10024', name: 'banner_show', type: 'Exposure', page: '热销看板', params: 3 },
        { id: 'EVT-10027', name: 'cart_add_click', type: 'Click', page: '购物车', params: 4 },
        { id: 'EVT-10028', name: 'cart_checkout_click', type: 'Click', page: '购物车', params: 6 },
    ];

    const filteredAssets = mockAssets.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.page.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
            <div className="w-[500px] bg-background border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md">
                    <h3 className="text-lg font-bold">从资产库拉取</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <SearchCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="搜索事件名或页面..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-muted/10 border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {/* Asset List */}
                <div className="flex-1 overflow-auto p-4 space-y-2">
                    {filteredAssets.map(asset => (
                        <div
                            key={asset.id}
                            onClick={() => onSelect(asset)}
                            className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-muted/5 cursor-pointer transition-all group shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="text-sm font-mono font-bold group-hover:text-primary transition-colors">{asset.name}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{asset.id} • {asset.page}</p>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-muted/10 border border-border">
                                    {asset.params} 参数
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10 font-bold">
                                    {asset.type}
                                </span>
                            </div>
                        </div>
                    ))}
                    {filteredAssets.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">未找到匹配的事件</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
