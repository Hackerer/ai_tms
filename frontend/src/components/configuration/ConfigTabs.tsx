import { FileText, Sliders, List } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TabItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    disabled?: boolean;
    comingSoon?: boolean;
}

interface ConfigTabsProps {
    currentTab: string;
    onTabChange: (tabId: string) => void;
    compact?: boolean; // 新增：紧凑模式，用于Header中
}

const tabs: TabItem[] = [
    {
        id: 'parameters',
        label: '参数管理',
        icon: Sliders,
        badge: 0,
    },
    {
        id: 'pages',
        label: '页面结构',
        icon: FileText,
        badge: 0,
    },
];

export const ConfigTabs = ({ currentTab, onTabChange, compact = false }: ConfigTabsProps) => {
    if (compact) {
        // 紧凑模式：用于Header中
        return (
            <div className="flex gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && onTabChange(tab.id)}
                            disabled={tab.disabled}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : tab.disabled
                                        ? "text-muted-foreground/40 cursor-not-allowed"
                                        : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>

                            {tab.comingSoon && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 font-bold">
                                    Coming Soon
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    // 标准模式：独立Tab栏
    return (
        <div className="border-b border-border bg-background/30 shrink-0">
            <div className="flex gap-2 px-8 pt-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && onTabChange(tab.id)}
                            disabled={tab.disabled}
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all",
                                "border-b-2 -mb-[2px]",
                                isActive
                                    ? "bg-primary/10 text-primary font-bold border-primary shadow-sm ring-1 ring-primary/20 ring-inset"
                                    : tab.disabled
                                        ? "text-muted-foreground/40 cursor-not-allowed border-transparent"
                                        : "text-muted-foreground hover:bg-muted/10 hover:text-foreground border-transparent"
                            )}
                        >
                            <Icon className={cn(
                                "w-4 h-4 shrink-0",
                                isActive && "drop-shadow-sm"
                            )} />
                            <span>{tab.label}</span>

                            {tab.badge !== undefined && tab.badge > 0 && !tab.comingSoon && (
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
                                    isActive
                                        ? "bg-primary/20 text-primary"
                                        : "bg-muted/10 text-muted-foreground"
                                )}>
                                    {tab.badge}
                                </span>
                            )}

                            {tab.comingSoon && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 font-bold">
                                    Coming Soon
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
