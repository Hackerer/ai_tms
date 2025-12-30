import {
    FolderTree,
    Search,
    Plus,
    Filter,
    MoreVertical,
    ChevronRight,
    ChevronDown,
    Globe,
    Tag,
    Layers
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useTree, type TreeNode } from '../context/TreeContext';

// --- Recursive Tree Item Component ---

const TreeItem = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
    const { selectedNode, setSelectedNode } = useTree();
    const { showToast } = useUI();
    const [isOpen, setIsOpen] = useState(true);
    const isActive = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedNode(node);

        if (node.type === 'page') {
            showToast(`已切换至: ${node.name}`, 'info');
        }
    };

    const toggleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const getIcon = () => {
        if (node.type === 'app') return Globe;
        if (node.type === 'module') return FolderTree;
        return Tag;
    };

    const Icon = getIcon();

    return (
        <div className="space-y-1">
            <div
                className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all group",
                    isActive ? "bg-primary/20 text-primary font-bold shadow-sm" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleClick}
            >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {hasChildren && (
                        <button onClick={toggleOpen} className="hover:bg-white/10 rounded p-0.5">
                            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                    )}
                </div>
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "group-hover:text-primary")} />
                <span className="text-sm font-medium flex-1 truncate">{node.name}</span>
                {node.event_count !== undefined && node.event_count > 0 && (
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0",
                        isActive ? "bg-primary/30 text-primary" : "bg-white/5 text-muted-foreground"
                    )}>
                        {node.event_count}
                    </span>
                )}
            </div>
            {isOpen && hasChildren && (
                <div className="space-y-1">
                    {node.children!.map(child => (
                        <TreeItem key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

export const AssetLibrary = () => {
    const navigate = useNavigate();
    const { openModal, showToast } = useUI();
    const { treeData, selectedNode, loadTree, isLoading } = useTree();
    const [eventSearch, setEventSearch] = useState('');
    const [events, setEvents] = useState<any[]>([]);

    // Load tree data on mount
    useEffect(() => {
        loadTree('APP-001'); // 默认加载第一个应用
    }, []);

    // Filter events based on selected node
    useEffect(() => {
        if (!selectedNode) {
            setEvents([]);
            return;
        }

        // Mock event data - 根据选中节点过滤
        const mockEvents = [
            { name: "hot_sale_click", id: "EVT-10023", type: "点击事件", props: 5, status: "Online", page_id: "PAGE-001" },
            { name: "banner_show", id: "EVT-10024", type: "展现事件", props: 3, status: "Online", page_id: "PAGE-001" },
            { name: "item_card_show", id: "EVT-10025", type: "展现事件", props: 8, status: "Reviewing", page_id: "PAGE-002" },
            { name: "filter_bar_click", id: "EVT-10026", type: "点击事件", props: 2, status: "Online", page_id: "PAGE-002" },
            { name: "cart_add_click", id: "EVT-10027", type: "点击事件", props: 4, status: "Online", page_id: "PAGE-004" },
            { name: "cart_checkout_click", id: "EVT-10028", type: "点击事件", props: 6, status: "Online", page_id: "PAGE-004" },
            { name: "checkout_confirm", id: "EVT-10029", type: "点击事件", props: 3, status: "Online", page_id: "PAGE-005" },
        ];

        let filtered = mockEvents;

        if (selectedNode.type === 'page') {
            // 只显示该页面的事件
            filtered = mockEvents.filter(e => e.page_id === selectedNode.id);
        } else if (selectedNode.type === 'module') {
            // 显示该模块下所有页面的事件
            const pageIds = getAllPageIds(selectedNode);
            filtered = mockEvents.filter(e => pageIds.includes(e.page_id));
        } else if (selectedNode.type === 'app') {
            // 显示所有事件
            filtered = mockEvents;
        }

        setEvents(filtered);
    }, [selectedNode]);

    const getAllPageIds = (node: TreeNode): string[] => {
        const ids: string[] = [];

        const traverse = (n: TreeNode) => {
            if (n.type === 'page') {
                ids.push(n.id);
            }
            if (n.children) {
                n.children.forEach(traverse);
            }
        };

        traverse(node);
        return ids;
    };

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(eventSearch.toLowerCase()) ||
        e.id.toLowerCase().includes(eventSearch.toLowerCase())
    );

    return (
        <div className="flex h-full bg-background overflow-hidden animate-in fade-in duration-500">
            {/* Search & Tree Panel */}
            <div className="w-72 border-r border-white/10 bg-black/20 backdrop-blur-sm flex flex-col pt-6 px-4">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="搜索业务域..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-sm text-muted-foreground">加载中...</div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pb-6 space-y-2">
                        {treeData.map(node => (
                            <TreeItem key={node.id} node={node} />
                        ))}
                    </div>
                )}

                <div className="py-4 border-t border-white/10">
                    <button
                        onClick={() => navigate('/assets/pages')}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                    >
                        <Layers className="w-3.5 h-3.5" />
                        页面管理
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-extrabold tracking-tight">
                            {selectedNode ? selectedNode.name : '资产库'}
                        </h2>
                        {selectedNode && (
                            <span className="text-xs text-muted-foreground font-mono">
                                {selectedNode.type === 'page' ? '页面' : selectedNode.type === 'module' ? '模块' : '应用'} • {filteredEvents.length} 个事件
                            </span>
                        )}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="搜索事件名或 ID..."
                                value={eventSearch}
                                onChange={(e) => setEventSearch(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 w-48 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/assets/parameters')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            参数池
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors">
                            <Filter className="w-3.5 h-3.5" />
                            高级筛选
                        </button>
                        <button
                            onClick={() => openModal('NEW_EVENT')}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            新增埋点
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-auto p-8 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/5 via-background to-background">
                    {!selectedNode ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <FolderTree className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-lg font-bold text-muted-foreground">请从左侧选择一个节点</p>
                                <p className="text-sm text-muted-foreground mt-2">选择应用、模块或页面以查看相关埋点事件</p>
                            </div>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-lg font-bold text-muted-foreground">暂无事件</p>
                                <p className="text-sm text-muted-foreground mt-2">该{selectedNode.type === 'page' ? '页面' : '节点'}下还没有埋点事件</p>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl overflow-hidden border-white/[0.05]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">埋点名称 (Event)</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">参数量</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">状态</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredEvents.map((evt) => (
                                        <tr
                                            key={evt.id}
                                            className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                                            onClick={() => navigate(`/assets/event/${evt.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{evt.name}</span>
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">{evt.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-[10px] text-muted-foreground">{evt.id}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                                    {evt.props}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                                    <div className={cn("w-1 h-1 rounded-full", evt.status === 'Online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-blue-500 animate-pulse")} />
                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">{evt.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    className="p-1 hover:bg-white/10 rounded-md transition-colors text-muted-foreground opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => { e.stopPropagation(); showToast(`已复制 ${evt.name} 标识符`, 'success'); }}
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
