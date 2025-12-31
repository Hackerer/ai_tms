import {
    Search,
    Plus,
    MoreVertical,
    Layers,
    Activity,
    Layout
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useTree } from '../context/TreeContext';
import { TreeItem } from '../components/TreeItem';
import { useAssets } from '../hooks/useAssets';
import { useAssetFilter } from '../hooks/useAssetFilter';
import { GlobalSearchBar } from '../components/asset_search/GlobalSearchBar';
import { FilterChips } from '../components/asset_search/FilterChips';
import { FilterBuilder } from '../components/asset_search/FilterBuilder';
import { FeatureIcon } from '../components/FeatureIcon';
import type { FilterConfig } from '../types/search';

const FILTER_CONFIGS: FilterConfig[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'multi-select',
        icon: Activity,
        options: [
            { label: 'Draft', value: 'Draft', color: 'bg-gray-500' },
            { label: 'Reviewing', value: 'Reviewing', color: 'bg-yellow-500' },
            { label: 'Online', value: 'Online', color: 'bg-green-500' },
            { label: 'Offline', value: 'Offline', color: 'bg-red-500' }
        ]
    },
    {
        key: 'type',
        label: 'Type',
        type: 'multi-select',
        icon: Layout,
        options: [
            { label: 'Click', value: 'Click' },
            { label: 'View', value: 'View' },
            { label: 'Custom', value: 'Custom' },
            { label: 'Exposition', value: 'Exposition' }
        ]
    }
];

export const AssetLibrary = () => {
    const navigate = useNavigate();
    const { openModal, showToast } = useUI();
    const { treeData, selectedNode, loadTree, isLoading: isTreeLoading } = useTree();

    const { events, isLoading: isEventsLoading } = useAssets(
        selectedNode?.type === 'page' ? selectedNode.id : undefined
    );

    useEffect(() => {
        loadTree('APP-001');
    }, []);

    const {
        filteredData: filteredEvents,
        searchState,
        setKeyword,
        addFilter,
        removeFilter
    } = useAssetFilter(events, FILTER_CONFIGS);

    return (
        <div className="flex h-full bg-background overflow-hidden animate-in fade-in duration-500">
            {/* Search & Tree Panel (Sidebar) */}
            <div className="w-72 border-r border-border bg-background/50 backdrop-blur-sm flex flex-col pt-6 px-4 z-20">
                <div className="relative mb-6 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="搜索业务域..."
                        className="w-full bg-muted/10 border border-border rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 transition-all"
                    />
                </div>

                {isTreeLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pb-6 space-y-1 pr-1 custom-scrollbar">
                        {treeData.map(node => (
                            <TreeItem key={node.id} node={node} />
                        ))}
                    </div>
                )}

                <div className="py-4 border-t border-border">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                        <FeatureIcon icon={Layers} variant="primary" className="w-8 h-8 rounded-lg" scale={0.8} />
                        <div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-tight opacity-70">Asset Stats</p>
                            <p className="text-xs font-bold text-foreground">{events.length} 个线上埋点</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                {/* Header Toolbar */}
                <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/60 backdrop-blur-xl z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-96">
                            <GlobalSearchBar
                                value={searchState.keyword}
                                onChange={setKeyword}
                                placeholder="全局搜索埋点定义、ID (CMD+K)..."
                            />
                        </div>
                        <div className="h-4 w-[1px] bg-border mx-2" />
                        <div className="flex-1 overflow-hidden">
                            <FilterChips
                                filters={searchState.filters}
                                configs={FILTER_CONFIGS}
                                onRemove={removeFilter}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                        <div className="flex bg-muted/10 p-1 rounded-lg border border-border">
                            <button onClick={() => navigate('/assets/pages')} className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm transition-all">页面</button>
                            <button onClick={() => navigate('/assets/parameters')} className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm transition-all">参数</button>
                        </div>

                        <FilterBuilder
                            configs={FILTER_CONFIGS}
                            activeFilters={searchState.filters}
                            onAddFilter={addFilter}
                        />

                        <button
                            onClick={() => openModal('NEW_EVENT')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg hover:shadow-primary/25 hover:brightness-110 active:scale-95 transition-all ml-2"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            新增埋点
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-8">
                    {isEventsLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground font-medium animate-pulse">正在同步数据资产...</p>
                            </div>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <FeatureIcon icon={Search} className="w-20 h-20 rounded-3xl" variant="purple" scale={1.5} />
                            <div>
                                <h3 className="text-xl font-bold text-foreground">未找到相关数据</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2 leading-relaxed">
                                    {selectedNode?.type === 'page'
                                        ? '该页面暂无已上线的埋点事件，您可以尝试清除筛选条件或新建埋点。'
                                        : '请从左侧业务树选择具体页面查看埋点。'}
                                </p>
                            </div>
                            {selectedNode?.type === 'page' && (
                                <button
                                    onClick={() => openModal('NEW_EVENT')}
                                    className="px-6 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
                                >
                                    立即新建
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl overflow-hidden border-border shadow-sm ring-1 ring-black/5">
                            <table className="w-full text-left">
                                <thead className="bg-muted/30 backdrop-blur-sm">
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Event Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 font-mono text-center">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 text-center">Params</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 text-center">Status</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {filteredEvents.map((evt) => (
                                        <tr
                                            key={evt.id}
                                            className="hover:bg-muted/5 transition-colors group cursor-pointer h-14"
                                            onClick={() => navigate(`/assets/event/${evt.id}`)}
                                        >
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col justify-center h-full">
                                                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-none mb-1.5">{evt.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted/10 w-fit">{evt.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="font-mono text-[11px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">{evt.id}</span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="text-[11px] font-bold text-foreground/70 px-2 py-1 rounded bg-muted/10">
                                                    {evt.params_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight",
                                                    evt.status === 'Online'
                                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", evt.status === 'Online' ? "bg-green-500" : "bg-blue-500")} />
                                                    {evt.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <button
                                                    className="p-2 hover:bg-background rounded-lg border border-transparent hover:border-border transition-all text-muted-foreground opacity-0 group-hover:opacity-100 shadow-sm"
                                                    onClick={(e) => { e.stopPropagation(); showToast(`已复制 ${evt.name}`, 'success'); }}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
