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
import type { FilterConfig } from '../types/search';

const FILTER_CONFIGS: FilterConfig[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'multi-select',
        icon: Activity,
        options: [
            { label: 'Draft', value: 'DRAFT', color: 'bg-gray-500' },
            { label: 'Reviewing', value: 'REVIEWING', color: 'bg-yellow-500' },
            { label: 'Online', value: 'ONLINE', color: 'bg-green-500' },
            { label: 'Offline', value: 'OFFLINE', color: 'bg-red-500' }
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
        <div className="flex h-full bg-surface-dim overflow-hidden animate-in fade-in duration-500">
            {/* Search & Tree Panel (Sidebar) - Transparency & Air */}
            <div className="w-64 xl:w-72 2xl:w-80 bg-surface-dim flex flex-col pt-8 px-6 z-20 shrink-0">
                <div className="relative mb-8 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search domains..."
                        className="w-full bg-surface-container border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:bg-surface-container-high text-foreground placeholder:text-muted transition-all"
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

                <div className="py-6">
                    <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">Total Assets</p>
                            <p className="text-xl font-black text-foreground">{events.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col rounded-tl-[40px] bg-surface-container-lowest shadow-2xl overflow-hidden my-4 mr-4 border border-border/50">
                {/* Header Toolbar */}
                <div className="h-20 flex items-center justify-between px-8 bg-surface-container-lowest z-10">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="w-96">
                            <GlobalSearchBar
                                value={searchState.keyword}
                                onChange={setKeyword}
                                placeholder="Search events, IDs (CMD+K)..."
                            />
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex-1 overflow-hidden">
                            <FilterChips
                                filters={searchState.filters}
                                configs={FILTER_CONFIGS}
                                onRemove={removeFilter}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-surface-container p-1 rounded-full">
                            <button onClick={() => navigate('/assets/pages')} className="px-4 py-1.5 rounded-full text-xs font-bold text-muted hover:bg-surface-container-lowest hover:text-foreground hover:shadow-sm transition-all">Pages</button>
                            <button onClick={() => navigate('/assets/parameters')} className="px-4 py-1.5 rounded-full text-xs font-bold text-muted hover:bg-surface-container-lowest hover:text-foreground hover:shadow-sm transition-all">Params</button>
                        </div>

                        <FilterBuilder
                            configs={FILTER_CONFIGS}
                            activeFilters={searchState.filters}
                            onAddFilter={addFilter}
                        />

                        <button
                            onClick={() => openModal('NEW_EVENT')}
                            className="btn-primary ml-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Event</span>
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto px-8 pb-8">
                    {isEventsLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm text-muted font-medium animate-pulse">Syncing assets...</p>
                            </div>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center">
                                <Search className="w-10 h-10 text-muted" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">No events found</h3>
                                <p className="text-sm text-muted max-w-xs mx-auto mt-2 leading-relaxed">
                                    Try adjusting your filters or search terms.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="px-6 py-4 text-label">Event Name</th>
                                        <th className="px-6 py-4 text-label text-center">ID</th>
                                        <th className="px-6 py-4 text-label text-center">Params</th>
                                        <th className="px-6 py-4 text-label text-center">Status</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredEvents.map((evt) => (
                                        <tr
                                            key={evt.id}
                                            className="list-row h-16 group"
                                            onClick={() => navigate(`/assets/event/${evt.id}`)}
                                        >
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col justify-center h-full">
                                                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-none mb-1.5">{evt.name}</span>
                                                    <span className="text-[10px] text-muted font-medium px-2 py-0.5 rounded-full bg-surface-container w-fit">{evt.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="font-mono text-[11px] text-muted group-hover:text-foreground transition-colors">{evt.id}</span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="text-[11px] font-bold text-foreground/70 px-2 py-1 rounded bg-surface-container">
                                                    {evt.params_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <div className="inline-flex items-center gap-1.5 justify-center">
                                                    <div className={cn("w-2 h-2 rounded-full",
                                                        evt.status === 'ONLINE' ? "bg-green-500" :
                                                            (evt.status as string) === 'DRAFT' ? "bg-gray-400" : "bg-blue-500"
                                                    )} />
                                                    <span className={cn("text-xs font-semibold",
                                                        evt.status === 'ONLINE' ? "text-green-600" : "text-muted"
                                                    )}>{evt.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <button
                                                    className="p-2 rounded-full hover:bg-surface-container text-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => { e.stopPropagation(); showToast(`Copied ${evt.name}`, 'success'); }}
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
