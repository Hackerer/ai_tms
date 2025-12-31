import { createContext, useContext, useState, type ReactNode } from 'react';

// --- Types ---

export interface TreeNode {
    id: string;
    name: string;
    type: 'app' | 'module' | 'page';
    parent_id?: string;
    children?: TreeNode[];
    event_count?: number;
    path?: string;
    module?: string;
    app_id?: string;
}

interface TreeContextType {
    selectedNode: TreeNode | null;
    setSelectedNode: (node: TreeNode | null) => void;
    treeData: TreeNode[];
    setTreeData: (data: TreeNode[]) => void;
    loadTree: (appId: string) => Promise<void>;
    isLoading: boolean;
    currentAppId: string | null;
}

// --- Context ---

const TreeContext = createContext<TreeContextType | undefined>(undefined);

// --- Provider ---

export const TreeProvider = ({ children }: { children: ReactNode }) => {
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentAppId, setCurrentAppId] = useState<string | null>(null);

    const loadTree = async (appId: string) => {
        setIsLoading(true);
        setCurrentAppId(appId);

        try {
            // TODO: 替换为真实 API 调用
            // const response = await fetch(`/api/apps/${appId}/pages`);
            // const pages = await response.json();

            // 临时 Mock 数据
            const mockPages = [
                { id: 'PAGE-001', name: '热销看板', path: '/home/hot-sales', parent_id: null, module: '首页模块', app_id: appId },
                { id: 'PAGE-002', name: '搜索结果页', path: '/home/search', parent_id: null, module: '首页模块', app_id: appId },
                { id: 'PAGE-003', name: '商品详情页', path: '/shop/detail', parent_id: null, module: '购物中心', app_id: appId },
                { id: 'PAGE-004', name: '购物车', path: '/shop/cart', parent_id: null, module: '购物中心', app_id: appId },
                { id: 'PAGE-005', name: '订单确认', path: '/shop/checkout', parent_id: 'PAGE-004', module: '购物中心', app_id: appId },
                { id: 'PAGE-006', name: '个人中心', path: '/profile', parent_id: null, module: '个人中心', app_id: appId },
            ];

            // 构建树形结构
            const tree = buildTree(mockPages, appId);
            setTreeData(tree);

            // 默认选中第一个节点
            if (tree.length > 0 && tree[0].children && tree[0].children.length > 0) {
                setSelectedNode(tree[0].children[0]);
            }
        } catch (error) {
            console.error('Failed to load tree:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const buildTree = (flatPages: { id: string; name: string; path: string; parent_id: string | null; module: string; app_id: string }[], appId: string): TreeNode[] => {
        // 按 module 分组
        const moduleMap: Record<string, typeof flatPages> = {};

        flatPages.forEach(page => {
            const moduleName = page.module || '未分类';
            if (!moduleMap[moduleName]) {
                moduleMap[moduleName] = [];
            }
            moduleMap[moduleName].push(page);
        });

        // 构建模块节点
        const modules: TreeNode[] = Object.entries(moduleMap).map(([moduleName, pages], index) => {
            // 为每个模块构建页面子树
            const pageNodes = buildPageTree(pages);

            return {
                id: `MODULE-${index}`,
                name: moduleName,
                type: 'module',
                app_id: appId,
                children: pageNodes,
                event_count: pageNodes.reduce((sum, p) => sum + (p.event_count || 0), 0),
            };
        });

        // 创建 App 根节点
        const appNode: TreeNode = {
            id: appId,
            name: '电商核心 App (iOS)',
            type: 'app',
            children: modules,
            event_count: modules.reduce((sum, m) => sum + (m.event_count || 0), 0),
        };

        return [appNode];
    };

    const buildPageTree = (flatPages: { id: string; name: string; path: string; parent_id: string | null; module: string; app_id: string }[]): TreeNode[] => {
        const map: Record<string, TreeNode> = {};
        const roots: TreeNode[] = [];

        // 第一遍: 创建所有页面节点
        flatPages.forEach(page => {
            map[page.id] = {
                id: page.id,
                name: page.name,
                type: 'page',
                parent_id: page.parent_id || undefined,
                path: page.path,
                module: page.module,
                app_id: page.app_id,
                children: [],
            };
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

    return (
        <TreeContext.Provider
            value={{
                selectedNode,
                setSelectedNode,
                treeData,
                setTreeData,
                loadTree,
                isLoading,
                currentAppId,
            }}
        >
            {children}
        </TreeContext.Provider>
    );
};

// --- Hook ---
// eslint-disable-next-line react-refresh/only-export-components
export const useTree = () => {
    const context = useContext(TreeContext);
    if (!context) {
        throw new Error('useTree must be used within TreeProvider');
    }
    return context;
};
