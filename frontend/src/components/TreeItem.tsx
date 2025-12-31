import { useState } from 'react';
import { ChevronDown, ChevronRight, Globe, FolderTree, Tag } from 'lucide-react';
import { useTree } from '../context/TreeContext';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import type { TreeNode } from '../types/asset';

interface TreeItemProps {
    node: TreeNode;
    level?: number;
}

export const TreeItem = ({ node, level = 0 }: TreeItemProps) => {
    const { selectedNode, setSelectedNode } = useTree();
    const { showToast } = useUI();
    const [isOpen, setIsOpen] = useState(true);
    const isActive = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedNode(node as any);

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
