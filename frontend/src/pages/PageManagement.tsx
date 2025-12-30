import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, ArrowLeft, ChevronRight, ChevronDown, FileText, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';

// 基于后端 Page 模型的字段定义
interface Page {
    id: string;
    tenant_id: string;
    app_id: string;
    parent_id?: string;
    name: string;
    path: string;
    module: string;
    description: string;
    created_at: string;
    children?: Page[];
    event_count?: number; // 扩展字段:该页面的事件数量
}

// 递归树节点组件
const PageTreeNode = ({ page, onSelect, selectedId, level = 0 }: {
    page: Page;
    onSelect: (page: Page) => void;
    selectedId?: string;
    level?: number;
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const isActive = selectedId === page.id;
    const hasChildren = page.children && page.children.length > 0;

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-all",
                    isActive ? "bg-primary/20 text-primary font-bold shadow-sm" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                )}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={() => onSelect(page)}
            >
                {hasChildren && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                        className="hover:bg-white/10 rounded p-0.5"
                    >
                        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                )}
                {!hasChildren && <div className="w-4" />}
                <FileText className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "group-hover:text-primary")} />
                <span className="flex-1 text-sm font-medium truncate">{page.name}</span>
                {page.event_count !== undefined && page.event_count > 0 && (
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0",
                        isActive ? "bg-primary/30 text-primary" : "bg-white/5 text-muted-foreground"
                    )}>
                        {page.event_count}
                    </span>
                )}
            </div>
            {isOpen && hasChildren && (
                <div className="space-y-1 mt-1">
                    {page.children!.map((child) => (
                        <PageTreeNode
                            key={child.id}
                            page={child}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const PageManagement = () => {
    const navigate = useNavigate();
    const { showToast } = useUI();
    const [pages, setPages] = useState<Page[]>([]);
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setIsLoading(true);
        try {
            // TODO: 替换为真实 API
            // const response = await fetch('/api/pages');
            // const data = await response.json();

            // Mock 数据
            const mockFlatPages = [
                { id: 'PAGE-001', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '热销看板', path: '/home/hot-sales', parent_id: null, module: '首页模块', description: '展示热销商品的看板页面', created_at: '2025-01-01 10:00:00', event_count: 6 },
                { id: 'PAGE-002', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '搜索结果页', path: '/home/search', parent_id: null, module: '首页模块', description: '商品搜索结果展示页', created_at: '2025-01-01 10:00:00', event_count: 4 },
                { id: 'PAGE-003', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '商品详情页', path: '/shop/detail', parent_id: null, module: '购物中心', description: '单个商品的详细信息页', created_at: '2025-01-05 14:20:00', event_count: 8 },
                { id: 'PAGE-004', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '购物车', path: '/shop/cart', parent_id: null, module: '购物中心', description: '用户购物车管理页面', created_at: '2025-01-05 14:20:00', event_count: 3 },
                { id: 'PAGE-005', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '订单确认', path: '/shop/checkout', parent_id: 'PAGE-004', module: '购物中心', description: '订单确认与支付页面', created_at: '2025-01-10 09:30:00', event_count: 5 },
                { id: 'PAGE-006', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '个人中心', path: '/profile', parent_id: null, module: '个人中心', description: '用户个人信息管理', created_at: '2025-01-15 16:45:00', event_count: 2 },
            ];

            const tree = buildTree(mockFlatPages);
            setPages(tree);
        } catch (error) {
            console.error('Failed to fetch pages:', error);
            showToast('加载页面失败', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const buildTree = (flatPages: any[]): Page[] => {
        const map: Record<string, Page> = {};
        const roots: Page[] = [];

        // 第一遍: 创建所有节点
        flatPages.forEach(page => {
            map[page.id] = { ...page, children: [] };
        });

        // 第二遍: 建立父子关系
        flatPages.forEach(page => {
            const node = map[page.id];
            if (page.parent_id && map[page.parent_id]) {
                map[page.parent_id].children!.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    };

    const getAllPages = (nodes: Page[]): Page[] => {
        const result: Page[] = [];
        const traverse = (n: Page) => {
            result.push(n);
            if (n.children) {
                n.children.forEach(traverse);
            }
        };
        nodes.forEach(traverse);
        return result;
    };

    const allPages = getAllPages(pages);

    return (
        <div className="flex h-full bg-background">
            {/* 左侧树形编辑器 */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/assets')}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回资产库
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-extrabold">页面结构管理</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                管理应用的页面层级结构 • 共 {allPages.length} 个页面
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => showToast('批量导入功能开发中...', 'info')}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                            >
                                批量导入
                            </button>
                            <button
                                onClick={() => showToast('新建页面功能开发中...', 'info')}
                                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5 inline mr-1" />
                                新建页面
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-sm text-muted-foreground">加载中...</div>
                    </div>
                ) : (
                    <div className="glass-card p-6 rounded-2xl border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                            <Globe className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-bold">电商核心 App (iOS)</h3>
                        </div>
                        <div className="space-y-1">
                            {pages.map(page => (
                                <PageTreeNode
                                    key={page.id}
                                    page={page}
                                    onSelect={setSelectedPage}
                                    selectedId={selectedPage?.id}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 右侧详情面板 */}
            {selectedPage ? (
                <div className="w-96 border-l border-white/10 bg-black/20 p-6 overflow-auto">
                    <h3 className="text-lg font-bold mb-1">{selectedPage.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono mb-6 uppercase">{selectedPage.id}</p>

                    <div className="space-y-6">
                        <div className="glass-card p-4 rounded-xl border-white/[0.05]">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">基本信息</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">页面路径</label>
                                    <p className="text-sm font-mono mt-1 bg-white/5 px-2 py-1 rounded border border-white/10">{selectedPage.path}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">所属模块</label>
                                    <p className="text-sm mt-1">{selectedPage.module}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">业务描述</label>
                                    <p className="text-sm mt-1 text-muted-foreground leading-relaxed">{selectedPage.description}</p>
                                </div>
                                {selectedPage.parent_id && (
                                    <div>
                                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">父页面</label>
                                        <p className="text-sm mt-1 font-mono text-primary">{selectedPage.parent_id}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-4 rounded-xl border-white/[0.05]">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">统计信息</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">埋点事件数量</span>
                                    <span className="text-lg font-bold text-primary">{selectedPage.event_count || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">子页面数量</span>
                                    <span className="text-lg font-bold">{selectedPage.children?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">创建时间</span>
                                    <span className="text-xs font-mono text-muted-foreground">{selectedPage.created_at.split(' ')[0]}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => showToast('编辑功能开发中...', 'info')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                            >
                                <Edit className="w-3.5 h-3.5" />
                                编辑页面
                            </button>
                            <button
                                onClick={() => showToast('删除功能开发中...', 'info')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                删除页面
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-96 border-l border-white/10 bg-black/20 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <FolderTree className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">请从左侧选择一个页面</p>
                    </div>
                </div>
            )}
        </div>
    );
};
