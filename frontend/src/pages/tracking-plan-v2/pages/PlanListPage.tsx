import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Edit, Lock, Eye, FlaskConical, Check, ArrowRight, User, Calendar, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { TrackingPlan, PlanStatus } from '../types/schema';
import { StatusConfig } from '../types/schema';

// Mock 数据：模拟后端返回的方案列表
const mockPlans: TrackingPlan[] = [
    {
        id: 'plan-001',
        name: '双十一购物车优化埋点',
        description: '针对购物车页面的用户行为埋点方案，包含加购、删除、结算等核心事件',
        status: 'DRAFT',
        version: 'v0.1.0',
        createdAt: '2026-01-02',
        updatedAt: '2026-01-02',
        createdBy: '张三',
        eventCount: 12,
        events: [],
    },
    {
        id: 'plan-002',
        name: '首页推荐位曝光埋点',
        description: '首页各推荐位的曝光和点击埋点，用于分析运营效果',
        status: 'REVIEW',
        version: 'v1.0.0',
        createdAt: '2025-12-28',
        updatedAt: '2026-01-01',
        createdBy: '李四',
        eventCount: 8,
        events: [],
    },
    {
        id: 'plan-003',
        name: '支付流程埋点 (7.0版本)',
        description: '覆盖支付流程的完整埋点方案，已通过技术评审',
        status: 'LOCKED',
        version: 'v1.2.0',
        createdAt: '2025-12-20',
        updatedAt: '2025-12-30',
        createdBy: '王五',
        eventCount: 25,
        events: [],
    },
    {
        id: 'plan-004',
        name: '搜索结果页优化埋点',
        description: '测试人员验收中，预计明天发布',
        status: 'TESTING',
        version: 'v2.0.0',
        createdAt: '2025-12-15',
        updatedAt: '2026-01-02',
        createdBy: '赵六',
        eventCount: 18,
        events: [],
    },
    {
        id: 'plan-005',
        name: '会员中心埋点 (6.5版本)',
        description: '已随 App 6.5 版本上线，数据采集正常',
        status: 'PUBLISHED',
        version: 'v1.0.0',
        createdAt: '2025-11-01',
        updatedAt: '2025-12-01',
        createdBy: '张三',
        eventCount: 30,
        events: [],
    },
];

// 状态图标映射
const StatusIcon: Record<PlanStatus, React.ElementType> = {
    DRAFT: Edit,
    REVIEW: Eye,
    LOCKED: Lock,
    TESTING: FlaskConical,
    PUBLISHED: Check,
};

/**
 * PlanListPage - 埋点方案列表页
 * 展示所有方案，并支持按状态筛选
 */
export const PlanListPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<PlanStatus | 'ALL'>('ALL');
    const [creatorFilter, setCreatorFilter] = useState<string>('ALL');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    // 获取所有唯一的创建人
    const creators = Array.from(new Set(mockPlans.map(p => p.createdBy)));

    // 筛选方案
    const filteredPlans = mockPlans.filter(plan => {
        const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || plan.status === statusFilter;
        const matchesCreator = creatorFilter === 'ALL' || plan.createdBy === creatorFilter;

        let matchesDate = true;
        if (dateRange.start) {
            matchesDate = matchesDate && plan.createdAt >= dateRange.start;
        }
        if (dateRange.end) {
            matchesDate = matchesDate && plan.createdAt <= dateRange.end;
        }

        return matchesSearch && matchesStatus && matchesCreator && matchesDate;
    });

    const handlePlanClick = (planId: string) => {
        navigate(`/tracking-v2/${planId}`);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="shrink-0 px-8 py-6 border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">埋点方案管理</h1>
                        <p className="text-sm text-muted-foreground mt-1">全生命周期管理：从需求定义到发布验收</p>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                        新建方案
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-4 mt-6">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="搜索方案名称..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-11 pr-4 rounded-xl bg-surface-container border border-transparent text-sm placeholder:text-muted-foreground focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>

                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1 bg-muted/10 rounded-full p-1 border border-border">
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                statusFilter === 'ALL'
                                    ? "bg-foreground text-background shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            全部状态
                        </button>
                        {(Object.keys(StatusConfig) as PlanStatus[]).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                    statusFilter === status
                                        ? "bg-foreground text-background shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {StatusConfig[status].label}
                            </button>
                        ))}
                    </div>

                    {/* Creator Filter */}
                    <div className="relative group">
                        <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-surface-container border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <select
                                value={creatorFilter}
                                onChange={(e) => setCreatorFilter(e.target.value)}
                                className="bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer appearance-none pr-4"
                            >
                                <option value="ALL">所有创建人</option>
                                {creators.map(creator => (
                                    <option key={creator} value={creator}>{creator}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-surface-container border border-transparent hover:border-primary/20 transition-all">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground font-bold" />
                        <div className="flex items-center gap-1">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="bg-transparent border-none text-[10px] p-0 w-24 focus:ring-0"
                            />
                            <span className="text-muted-foreground mx-1 text-[10px]">-</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="bg-transparent border-none text-[10px] p-0 w-24 focus:ring-0"
                            />
                        </div>
                        {(dateRange.start || dateRange.end) && (
                            <button
                                onClick={() => setDateRange({ start: '', end: '' })}
                                className="p-1 hover:bg-muted/20 rounded-full transition-colors"
                            >
                                <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content - Plan Cards Grid */}
            <div className="flex-1 overflow-auto p-8 bg-muted/5">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {filteredPlans.map(plan => {
                        const config = StatusConfig[plan.status];
                        const Icon = StatusIcon[plan.status];
                        return (
                            <div
                                key={plan.id}
                                onClick={() => handlePlanClick(plan.id)}
                                className="group card-standard p-5 cursor-pointer hover:border-primary/30"
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border",
                                        config.color
                                    )}>
                                        <Icon className="w-3 h-3" />
                                        {config.label}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); }}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/20 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Card Body */}
                                <h3 className="text-base font-bold text-foreground mb-1.5 line-clamp-1">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 h-8">{plan.description}</p>

                                {/* Card Footer */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <span>{plan.eventCount} 事件</span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span>{plan.version}</span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span>{plan.createdBy}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {filteredPlans.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <Filter className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground font-medium">没有匹配的方案</p>
                            <p className="text-xs text-muted-foreground mt-1">尝试调整筛选条件</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlanListPage;
