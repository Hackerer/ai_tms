import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, ArrowLeft, ChevronRight, ChevronDown, FileText, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import { assetService } from '../services/assetService';
import { FeatureIcon } from '../components/FeatureIcon';
import type { Page } from '../types/asset';

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
                    "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer group transition-all",
                    isActive
                        ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20"
                        : "hover:bg-muted/5 text-muted-foreground hover:text-foreground"
                )}
                style={{ paddingLeft: `${level * 20 + 12}px` }}
                onClick={() => onSelect(page)}
            >
                {hasChildren && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                        className="hover:bg-muted/20 rounded p-0.5 transition-colors"
                    >
                        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                )}
                {!hasChildren && <div className="w-4" />}
                <FileText className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                <span className="flex-1 text-sm font-medium truncate tracking-tight">{page.name}</span>
                {page.event_count !== undefined && page.event_count > 0 && (
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 font-bold",
                        isActive ? "bg-primary/20 text-primary" : "bg-muted/10 text-muted-foreground"
                    )}>
                        {page.event_count}
                    </span>
                )}
            </div>
            {isOpen && hasChildren && (
                <div className="space-y-0.5 mt-0.5 relative before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-px before:bg-border/50">
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
    const { showToast, openModal } = useUI();
    const [pages, setPages] = useState<Page[]>([]);
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setIsLoading(true);
        try {
            const data = await assetService.getPages('APP-001');

            const buildTree = (list: Page[], parentId: string | null = null): Page[] => {
                return list
                    .filter(item => (parentId ? item.parent_id === parentId : !item.parent_id))
                    .map(item => ({
                        ...item,
                        children: buildTree(list, item.id)
                    }));
            };

            const tree = buildTree(data);
            setPages(tree);
        } catch (error) {
            console.error('Failed to fetch pages:', error);
            showToast('加载页面数据失败', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getAllPagesCount = (nodes: Page[]): number => {
        let count = 0;
        const traverse = (n: Page) => {
            count++;
            if (n.children) {
                n.children.forEach(traverse);
            }
        };
        nodes.forEach(traverse);
        return count;
    };

    const totalPagesCount = getAllPagesCount(pages);

    return (
        <div className="flex h-full bg-background">
            {/* 左侧树形编辑器 */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/assets')}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        返回资产库
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">页面结构管理</h2>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">
                                管理应用的页面层级结构 • 共 {totalPagesCount} 个页面
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => showToast('批量导入功能开发中...', 'info')}
                                className="px-4 py-2 rounded-lg bg-muted/10 border border-border text-xs font-bold hover:bg-muted/20 transition-colors text-foreground"
                            >
                                批量导入
                            </button>
                            <button
                                onClick={() => openModal('NEW_PAGE')}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                新建页面
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="card-standard p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                            <FeatureIcon icon={Globe} variant="primary" className="w-8 h-8 rounded-lg" scale={0.8} />
                            <div>
                                <h3 className="text-sm font-bold text-foreground">电商核心 App (iOS)</h3>
                                <p className="text-xs text-muted-foreground">Main Application Tree</p>
                            </div>
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
                <div className="w-80 xl:w-96 2xl:w-[420px] border-l border-border bg-background/50 p-6 xl:p-8 overflow-auto backdrop-blur-sm shadow-xl z-10 transition-all shrink-0">
                    <div className="flex items-center gap-4 mb-8">
                        <FeatureIcon icon={FileText} variant="primary" className="w-12 h-12 rounded-xl shrink-0" />
                        <div className="min-w-0">
                            <h3 className="text-xl font-bold text-foreground leading-tight truncate" title={selectedPage.name}>
                                {selectedPage.name}
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider opacity-60">
                                {selectedPage.id}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card-standard p-5">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-1 h-3 bg-primary rounded-full" />
                                基本信息
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5 opacity-70">页面路径</label>
                                    <p className="text-sm font-mono bg-muted/10 px-3 py-2 rounded-lg border border-border/50 text-foreground break-all">{selectedPage.path}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5 opacity-70">所属模块</label>
                                    <p className="text-sm font-medium text-foreground">{selectedPage.module}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5 opacity-70">业务描述</label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedPage.description}</p>
                                </div>
                                {selectedPage.parent_id && (
                                    <div>
                                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5 opacity-70">父页面</label>
                                        <p className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded w-fit">{selectedPage.parent_id}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-standard p-5">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-1 h-3 bg-green-500 rounded-full" />
                                统计数据
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 rounded hover:bg-muted/5 transition-colors">
                                    <span className="text-sm text-muted-foreground">埋点事件数量</span>
                                    <span className="text-lg font-bold text-primary">{selectedPage.event_count || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded hover:bg-muted/5 transition-colors">
                                    <span className="text-sm text-muted-foreground">子页面数量</span>
                                    <span className="text-lg font-bold text-foreground">{selectedPage.children?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded hover:bg-muted/5 transition-colors">
                                    <span className="text-sm text-muted-foreground">创建时间</span>
                                    <span className="text-xs font-mono text-muted-foreground">{selectedPage.created_at?.split(' ')[0]}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                onClick={() => showToast('编辑功能开发中...', 'info')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted/10 border border-border text-xs font-bold hover:bg-muted/20 transition-colors text-foreground"
                            >
                                <Edit className="w-3.5 h-3.5" />
                                编辑页面信息
                            </button>
                            <button
                                onClick={() => showToast('删除功能开发中...', 'info')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/5 border border-red-500/10 text-red-600 text-xs font-bold hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                删除页面
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-80 xl:w-96 2xl:w-[420px] border-l border-border bg-background/50 p-6 flex items-center justify-center backdrop-blur-sm shrink-0">
                    <div className="text-center">
                        <FeatureIcon icon={FolderTree} className="w-20 h-20 mx-auto mb-6 opacity-80" variant="primary" scale={1.2} />
                        <h3 className="text-lg font-bold text-foreground">No Selection</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto">
                            请从左侧页面树中选择一个节点以查看详细配置。
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
