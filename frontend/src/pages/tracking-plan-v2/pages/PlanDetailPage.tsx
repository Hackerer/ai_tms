import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Eye, Lock, FlaskConical, Check, Code, Play, FileText, Send, MessageSquare, Save, History, ExternalLink, ShieldCheck, SearchCode, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useUI } from '../../../context/UIContext';
import type { TrackingPlan, TrackingEvent, PlanStatus } from '../types/schema';
import { StatusConfig } from '../types/schema';
import { EventEditor } from '../components/EventEditor';
import { SchemaViewer } from '../components/SchemaViewer';
import { CodegenPreview } from '../components/CodegenPreview';
import { LiveConsoleAudit } from '../components/LiveConsoleAudit';
import { AssetCombobox } from '../../../components/AssetCombobox';
import type { AssetItem } from '../../../components/AssetLibrarySidebar';

// Mock 数据：完善的数据结构 (增加更多示例数据以供展示)
const fullMockEvents: TrackingEvent[] = [
    {
        id: 'ev-1',
        name: '加入购物车',
        identifier: 'add_to_cart',
        triggerCondition: '用户点击商品详情页的“加入购物车”按钮',
        parameters: [
            { id: 'p-1', name: '商品ID', identifier: 'product_id', type: 'STRING', isRequired: true, description: '唯一标识商品的UUID' },
            { id: 'p-2', name: '商品分类', identifier: 'category', type: 'ENUM', isRequired: true, enumValues: ['ELECTRONICS', 'CLOTHING', 'FOOD'] },
            { id: 'p-3', name: '数量', identifier: 'quantity', type: 'NUMBER', isRequired: false, exampleValue: '1' }
        ]
    },
    {
        id: 'ev-2',
        name: '搜索请求',
        identifier: 'search_query',
        triggerCondition: '搜索输入框失去焦点或触发搜索键',
        parameters: [
            { id: 'p-4', name: '关键词', identifier: 'keyword', type: 'STRING', isRequired: true },
            { id: 'p-5', name: '搜索来源', identifier: 'source', type: 'STRING', isRequired: false }
        ]
    }
];

const mockPlansByStatus: Record<string, TrackingPlan> = {
    'plan-001': {
        id: 'plan-001',
        name: '双十一购物车优化埋点',
        description: '针对购物车页面的用户行为埋点方案',
        status: 'DRAFT',
        version: 'v0.1.0',
        createdAt: '2026-01-02',
        updatedAt: '2026-01-02',
        createdBy: '张三',
        eventCount: 2,
        events: fullMockEvents.slice(0, 1),
    },
    'plan-002': {
        id: 'plan-002',
        name: '首页推荐位曝光埋点',
        description: '首页各推荐位的曝光和点击埋点',
        status: 'REVIEW',
        version: 'v1.0.0',
        createdAt: '2025-12-28',
        updatedAt: '2026-01-01',
        createdBy: '李四',
        eventCount: 2,
        events: fullMockEvents
    },
    'plan-003': {
        id: 'plan-003',
        name: '支付流程埋点 (7.0版本)',
        description: '覆盖支付流程的完整埋点方案，已通过技术评审',
        status: 'LOCKED',
        version: 'v1.2.0',
        createdAt: '2025-12-20',
        updatedAt: '2025-12-30',
        createdBy: '王五',
        eventCount: 2,
        events: fullMockEvents
    },
    'plan-004': {
        id: 'plan-004',
        name: '搜索结果页优化埋点',
        description: '测试人员验收中，预计明天发布',
        status: 'TESTING',
        version: 'v2.0.0',
        createdAt: '2025-12-15',
        updatedAt: '2026-01-02',
        createdBy: '赵六',
        eventCount: 2,
        events: fullMockEvents
    },
    'plan-005': {
        id: 'plan-005',
        name: '会员中心埋点 (6.5版本)',
        description: '已随 App 6.5 版本上线',
        status: 'PUBLISHED',
        version: 'v1.0.0',
        createdAt: '2025-11-01',
        updatedAt: '2025-12-01',
        createdBy: '张三',
        eventCount: 2,
        events: fullMockEvents
    },
};

// 状态流程定义 (保留 original 以免出错)
const statusFlow: PlanStatus[] = ['DRAFT', 'REVIEW', 'LOCKED', 'TESTING', 'PUBLISHED'];
const StatusIcon: Record<PlanStatus, React.ElementType> = {
    DRAFT: Edit,
    REVIEW: Eye,
    LOCKED: Lock,
    TESTING: FlaskConical,
    PUBLISHED: Check,
};

const LifecycleStatusBar: React.FC<{ currentStatus: PlanStatus }> = ({ currentStatus }) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return (
        <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-border mt-6">
            {statusFlow.map((status, index) => {
                const config = StatusConfig[status];
                const Icon = StatusIcon[status];
                const isActive = index === currentIndex;
                const isComplete = index < currentIndex;
                return (
                    <React.Fragment key={status}>
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                            isActive ? `${config.color.split(' ')[0]} bg - surface - container border` : "",
                            isComplete ? "text-green-500" : "",
                            !isActive && !isComplete ? "text-muted-foreground/50" : "text-muted-foreground"
                        )}>
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center border",
                                isComplete ? "bg-green-500/10 border-green-500/20" : "border-transparent",
                                isActive ? "bg-primary/10 border-primary/20" : ""
                            )}>
                                {isComplete ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Icon className={cn("w-3.5 h-3.5", isActive ? "text-foreground" : "")} />}
                            </div>
                            <span className={cn("text-xs font-bold", isActive ? "text-foreground" : "")}>{config.label}</span>
                        </div>
                        {index < statusFlow.length - 1 && <div className={cn("h-[1px] flex-1 mx-2", index < currentIndex ? "bg-green-500/30" : "bg-border/30")}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

type RoleType = 'PM' | 'DEV' | 'QA';
const roleTabsConfig: { key: RoleType; label: string; icon: React.ElementType }[] = [
    { key: 'PM', label: '产品视图', icon: FileText },
    { key: 'DEV', label: '研发视图', icon: Code },
    { key: 'QA', label: '测试视图', icon: Play },
];

function getAvailableRoles(status: PlanStatus): RoleType[] {
    switch (status) {
        case 'DRAFT':
        case 'REVIEW': return [];
        case 'LOCKED': return ['PM', 'DEV'];
        case 'TESTING':
        case 'PUBLISHED': return ['PM', 'DEV', 'QA'];
        default: return [];
    }
}

export const PlanDetailPage: React.FC = () => {
    const { id: planId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useUI();
    const initialPlan = planId ? mockPlansByStatus[planId] : mockPlansByStatus['plan-001'];
    const [plan, setPlan] = useState<TrackingPlan>(initialPlan);
    const [isSaving, setIsSaving] = useState(false);
    const availableRoles = useMemo(() => getAvailableRoles(plan.status), [plan.status]);
    const hasRoleTabs = availableRoles.length > 0;
    const [activeRole, setActiveRole] = useState<RoleType>(availableRoles[0] || 'PM');

    // 强制同步 activeRole，当 status 改变导致 Roles 改变时
    useEffect(() => {
        if (availableRoles.length > 0 && !availableRoles.includes(activeRole)) {
            setActiveRole(availableRoles[0]);
        }
    }, [availableRoles, activeRole]);

    const currentRole = availableRoles.includes(activeRole) ? activeRole : (availableRoles[0] || 'PM');

    // 资产库检索状态
    const [isComboboxOpen, setIsComboboxOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock 资产库数据
    const mockAssets: AssetItem[] = [
        { id: 'EVT-10023', name: 'hot_sale_click', type: 'Click', page: '热销看板', params: 5 },
        { id: 'EVT-10024', name: 'banner_show', type: 'Exposure', page: '热销看板', params: 3 },
        { id: 'EVT-10027', name: 'cart_add_click', type: 'Click', page: '购物车', params: 4 },
        { id: 'EVT-10028', name: 'cart_checkout_click', type: 'Click', page: '购物车', params: 6 },
        { id: 'EVT-10029', name: 'product_view', type: 'Exposure', page: '商品详情', params: 8 },
        { id: 'EVT-10030', name: 'checkout_submit', type: 'Click', page: '结算页', params: 10 },
    ];

    const handleEventsChange = (newEvents: TrackingEvent[]) => setPlan({ ...plan, events: newEvents, eventCount: newEvents.length });

    // 从资产库添加事件
    const handleAddFromAsset = (assets: AssetItem[]) => {
        const newEvents: TrackingEvent[] = assets.map(asset => ({
            id: asset.id,
            name: asset.name,
            identifier: asset.name,
            description: `从资产库导入: ${asset.page} - ${asset.type} `,
            operation: 'edit', // 从资产库添加的事件标记为edit
            parameters: [] // 实际应该从资产库获取参数
        }));

        const updatedEvents = [...plan.events, ...newEvents];
        setPlan({ ...plan, events: updatedEvents, eventCount: updatedEvents.length });
        showToast(`成功添加 ${assets.length} 个事件`, 'success');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            showToast('草稿保存成功', 'success');
        }, 800);
    };

    const handleStatusChange = (newStatus: PlanStatus) => {
        setIsSaving(true);
        setTimeout(() => {
            setPlan(prev => ({ ...prev, status: newStatus }));
            setIsSaving(false);
            showToast(`状态已更新为: ${newStatus} `, 'info');
        }, 600);
    };

    return (
        <div className="flex flex-col h-full bg-background selection:bg-primary/20">
            {/* Header */}
            <div className="shrink-0 px-8 pt-6 pb-6 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/tracking-v2')} className="p-2.5 rounded-xl hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border/50">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black tracking-tight text-foreground">{plan.name}</h1>
                            <span className="text-xs font-mono px-2 py-0.5 bg-muted rounded border border-border text-muted-foreground">{plan.version}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 opacity-70">{plan.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 rounded-full border border-border bg-surface-container-lowest text-xs font-bold hover:bg-muted transition-all">
                            <Save className={cn("w-4 h-4", isSaving ? "animate-spin" : "")} />
                            {isSaving ? '正在保存...' : '存为草稿'}
                        </button>
                        <button
                            onClick={() => handleStatusChange('REVIEW')}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 rounded-full bg-foreground text-background text-xs font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-foreground/10 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            发起评审
                        </button>
                    </div>
                </div>
                <LifecycleStatusBar currentStatus={plan.status} />
                {hasRoleTabs && (
                    <div className="flex items-center gap-1 mt-6 bg-surface-container-low rounded-full p-1.5 border border-border w-fit shadow-inner">
                        {roleTabsConfig.filter(tab => availableRoles.includes(tab.key)).map(tab => (
                            <button key={tab.key} onClick={() => setActiveRole(tab.key)} className={cn("flex items-center gap-2.5 px-6 py-2 rounded-full text-xs font-bold transition-all", currentRole === tab.key ? "bg-foreground text-background shadow-lg shadow-foreground/20 scale-105" : "text-muted-foreground hover:text-foreground hover:bg-muted/20")}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-10">
                <div className="max-w-[1200px] mx-auto">
                    {/* DRAFT View */}
                    {plan.status === 'DRAFT' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-black text-foreground">埋点方案编辑器</h2>
                                <p className="text-sm text-muted-foreground max-w-2xl">在此定义您的埋点架构。每个事件代表一个用户行为,参数则提供行为的上下文细节。</p>
                            </div>

                            {/* 资产库检索工具栏 */}
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 max-w-2xl group">
                                    <SearchCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsComboboxOpen(true)}
                                        placeholder="搜索资产库添加已有埋点事件..."
                                        className="w-full bg-surface-container-high border border-border rounded-xl pl-10 pr-24 py-2.5 text-sm text-left text-foreground placeholder:text-muted-foreground hover:bg-surface-container-highest transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-surface-container px-2 py-1 rounded border border-border text-muted-foreground pointer-events-none font-medium">
                                        从资产库添加
                                    </span>
                                    {/* AssetCombobox */}
                                    <AssetCombobox
                                        open={isComboboxOpen}
                                        onOpenChange={(open) => {
                                            setIsComboboxOpen(open);
                                            if (!open) setSearchQuery('');
                                        }}
                                        onSelect={handleAddFromAsset}
                                        searchQuery={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        availableAssets={mockAssets}
                                    />
                                </div>

                                {/* 新建埋点事件按钮 - 与搜索框对齐 */}
                                <button
                                    onClick={() => {
                                        const newEvent: TrackingEvent = {
                                            id: crypto.randomUUID(),
                                            name: '新事件',
                                            identifier: 'new_event_clicked',
                                            operation: 'create',
                                            parameters: []
                                        };
                                        const updatedEvents = [...plan.events, newEvent];
                                        setPlan({ ...plan, events: updatedEvents, eventCount: updatedEvents.length });
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition-all shadow-sm shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                    新建埋点事件
                                </button>
                            </div>

                            <div className="card-standard p-8 bg-surface-container-lowest border-border/40"><EventEditor events={plan.events || []} onChange={handleEventsChange} /></div>
                        </div>
                    )}

                    {/* REVIEW View */}
                    {plan.status === 'REVIEW' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-xl font-black text-foreground">评审详情预览</h2>
                                    <p className="text-sm text-muted-foreground max-w-2xl">目前正在展示 DRAFT v0.1.0 的最终预定义资产。</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleStatusChange('DRAFT')}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all group disabled:opacity-50"
                                    >
                                        <History className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                                        打回修改
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('LOCKED')}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 text-white text-xs font-black hover:scale-[1.02] transition-all shadow-xl shadow-green-500/20 disabled:opacity-50"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        核准锁定
                                    </button>
                                </div>
                            </div>
                            <div className="card-standard p-8 bg-surface-container-lowest border-border/40">
                                <SchemaViewer events={plan.events || []} mode="REVIEW" title="PROPOSED SCHEMA" description="请审阅以下事件及字段定义，核准后将锁定并生成代码。" />
                            </div>
                            <div className="card-standard p-8 bg-surface-container-lowest border-border/40">
                                <div className="flex items-center gap-2 mb-6"><MessageSquare className="w-5 h-5 text-primary" /><h3 className="text-base font-black text-foreground">协同评审意见</h3></div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-muted/10 rounded-2xl border border-border/50">
                                        <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-foreground">架构组 @李工</span><span className="text-[10px] text-muted-foreground">10 分钟前</span></div>
                                        <p className="text-sm text-muted-foreground">建议 product_id 参数统一使用 STRING 格式，避免后续 BigInt 溢出问题。</p>
                                    </div>
                                    <div className="p-4 bg-muted/5 rounded-2xl border border-dashed border-border/50 text-center text-xs text-muted-foreground">点击输入框，留下您的专业建议...</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LOCKED/TESTING/PUBLISHED Views */}
                    {hasRoleTabs && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {currentRole === 'PM' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-xl font-black text-foreground">产品视图：资产概览</h2>
                                            <p className="text-sm text-muted-foreground max-w-2xl">此方案已于 {plan.updatedAt} 锁定，任何变更需开启新版本。</p>
                                        </div>
                                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-bold transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                            导出资产文档
                                        </button>
                                    </div>
                                    <div className="card-standard p-8 bg-surface-container-lowest border-border/40">
                                        <SchemaViewer events={plan.events || []} title="LOCKED ASSETS" description="当前锁定的埋点标准，研发和测试将以此为唯一事实来源。" />
                                    </div>
                                </div>
                            )}

                            {currentRole === 'DEV' && (
                                <div className="space-y-8">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-xl font-black text-foreground">研发工作台：执行引擎</h2>
                                        <p className="text-sm text-muted-foreground max-w-2xl">自动生成的代码和实时控制台，支持方案的快速落地。</p>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                        <div className="lg:col-span-3 min-h-[500px]">
                                            <CodegenPreview events={plan.events || []} planName={plan.name} />
                                        </div>
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="h-[320px]">
                                                <LiveConsoleAudit />
                                            </div>

                                            <div className="card-standard p-8 bg-primary/5 border-primary/10">
                                                <h3 className="text-sm font-black text-primary tracking-widest uppercase mb-4">Dev Quick Start</h3>
                                                <ul className="space-y-3">
                                                    {[
                                                        { step: '1', text: 'Install SDK: @tms/sdk-web' },
                                                        { step: '2', text: 'Init with Project Token' },
                                                        { step: '3', text: 'Import generated interfaces' },
                                                    ].map(item => (
                                                        <li key={item.step} className="flex items-start gap-3">
                                                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">{item.step}</span>
                                                            <span className="text-[11px] text-muted-foreground font-bold">{item.text}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-standard p-8 bg-surface-container-lowest border-border/40">
                                        <SchemaViewer events={plan.events || []} title="REFERENCE SCHEMA" />
                                    </div>
                                </div>
                            )}

                            {currentRole === 'QA' && (
                                <div className="space-y-8">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-xl font-black text-foreground">测试验收：端到端验证</h2>
                                        <p className="text-sm text-muted-foreground max-w-2xl">自动化验收引擎已就绪，目前暂无来自 iOS/Android 的测试流量。</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        {[
                                            { label: 'SCHEMA 校验', status: 'PASS', score: '100%' },
                                            { label: '参数覆盖率', status: 'PASS', score: '98.2%' },
                                            { label: '触发时机', status: 'PENDING', score: '--' },
                                        ].map((item, i) => (
                                            <div key={i} className="card-standard p-6 bg-surface-container-lowest border-border/40 flex flex-col items-center gap-2">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">{item.label}</span>
                                                <span className="text-2xl font-black text-foreground">{item.score}</span>
                                                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", item.status === 'PASS' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground border-transparent")}>{item.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-12 bg-muted/5 rounded-[40px] border border-dashed border-border text-center text-muted-foreground">
                                        <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-sm font-bold">自动化验收引擎已就绪</p>
                                        <p className="text-xs opacity-60 mt-1">目前暂无来自 iOS/Android 的测试流量。</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlanDetailPage;
