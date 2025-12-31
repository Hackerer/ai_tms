import {
    TrendingUp,
    Plus,
    Search,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    FileText,
    Library
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { FeatureIcon } from '../components/FeatureIcon';
import { SparkLine } from '../components/SparkLine';

const StatCard = ({ title, value, change, icon: Icon, variant, chartColor, data, onClick }: any) => {
    return (
        <div
            className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
            onClick={onClick}
        >
            <div className="flex justify-between items-start z-10">
                <FeatureIcon icon={Icon} variant={variant} />
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {change}
                </span>
            </div>
            <div className="mt-6 z-10">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex items-end justify-between mt-1">
                    <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{value}</h3>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-100 transition-opacity">
                <SparkLine data={data} color={chartColor} height={60} />
            </div>
        </div>
    );
};

const RequestRow = ({ id, asset, status, date, onClick }: any) => {
    return (
        <tr
            className="border-b border-border/40 hover:bg-muted/5 transition-colors group cursor-pointer h-14"
            onClick={onClick}
        >
            <td className="px-6 py-4 text-xs font-mono font-medium text-muted-foreground group-hover:text-primary transition-colors">{id}</td>
            <td className="px-6 py-4 text-sm font-semibold text-foreground">{asset}</td>
            <td className="px-6 py-4">
                <span className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                    status === 'Approved' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                        status === 'Reviewing' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                            "bg-muted/10 text-muted-foreground border-border"
                )}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-xs text-muted-foreground tabular-nums">{date}</td>
            <td className="px-6 py-4 text-right">
                <button className="p-2 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
};

export const Dashboard = () => {
    const { openModal, showToast } = useUI();
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background p-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">仪表盘概览</h1>
                    <p className="text-muted-foreground mt-2 text-sm">欢迎回来，实时监控您的埋点数据资产。</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="全局搜索 (⌘+K)..."
                            onKeyDown={(e) => e.key === 'Enter' && showToast('正在全局检索资产库...', 'info')}
                            className="pl-10 pr-4 py-2.5 bg-muted/10 border border-transparent rounded-xl focus:bg-background focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/10 w-80 transition-all text-sm text-foreground placeholder:text-muted-foreground/60 shadow-inner"
                        />
                    </div>
                    <button
                        onClick={() => openModal('NEW_REQUEST')}
                        className="glass-button px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm text-primary-foreground bg-primary shadow-lg hover:shadow-primary/25 border-none hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        新建需求
                    </button>
                </div>
            </header>

            {/* Bento Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="资产总数"
                    value="1,284"
                    change="+12.5%"
                    icon={Library}
                    variant="primary"
                    chartColor="var(--chart-1)"
                    data={[10, 25, 40, 30, 45, 50, 48, 60, 55, 70]}
                    onClick={() => navigate('/assets')}
                />
                <StatCard
                    title="本月新增"
                    value="156"
                    change="+8.2%"
                    icon={TrendingUp}
                    variant="purple"
                    chartColor="var(--chart-4)"
                    data={[5, 10, 8, 15, 12, 20, 25, 22, 30, 28]}
                    onClick={() => navigate('/assets?filter=thisMonth')}
                />
                <StatCard
                    title="待办审批"
                    value="23"
                    change="-2%"
                    icon={Clock}
                    variant="warning"
                    chartColor="var(--chart-3)"
                    data={[20, 18, 22, 20, 15, 12, 10, 8, 5, 23]}
                    onClick={() => navigate('/workflows?status=reviewing')}
                />
                <StatCard
                    title="已上线"
                    value="98.5%"
                    change="+0.1%"
                    icon={CheckCircle2}
                    variant="success"
                    chartColor="var(--chart-2)"
                    data={[90, 92, 91, 94, 95, 96, 95, 97, 98, 98.5]}
                    onClick={() => showToast('查看已上线资产详情', 'info')}
                />
            </div>

            {/* Tables & Activity Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Requests - 8 Cols */}
                <div className="lg:col-span-8 glass-card rounded-2xl overflow-hidden border-border shadow-sm flex flex-col">
                    <div className="px-6 py-5 border-b border-border/50 flex justify-between items-center bg-muted/5 backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="font-bold text-sm text-foreground">最近需求单</h4>
                        </div>
                        <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5">
                            查看全部
                        </button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/5 border-b border-border/50">
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">ID</th>
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">名称</th>
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">状态</th>
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">更新日期</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                <RequestRow id="REQ-9821" asset="2025Q1 数据治理" status="Approved" date="2025-12-28" onClick={() => navigate('/workbench/REQ-9821')} />
                                <RequestRow id="REQ-9822" asset="双十一活动埋点" status="Reviewing" date="2025-12-29" onClick={() => navigate('/workbench/REQ-9822')} />
                                <RequestRow id="REQ-9823" asset="登录流失率专项" status="Draft" date="2025-12-30" onClick={() => navigate('/workbench/REQ-9823')} />
                                <RequestRow id="REQ-9824" asset="新版个人中心埋点" status="Reviewing" date="2025-12-30" onClick={() => navigate('/workbench/REQ-9824')} />
                                <RequestRow id="REQ-9825" asset="搜索质量评估" status="Approved" date="2025-12-30" onClick={() => navigate('/workbench/REQ-9825')} />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Activity Hub - 4 Cols */}
                <div className="lg:col-span-4 glass-card rounded-2xl p-6 border-border shadow-sm flex flex-col h-full">
                    <h4 className="font-bold mb-6 text-sm text-foreground flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full" />
                        系统动态
                    </h4>
                    <div className="relative pl-2 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative flex gap-4 group cursor-pointer" onClick={() => showToast('正在跳转至动态详情...', 'info')}>
                                <div className="absolute left-px mt-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary z-10 group-hover:scale-125 transition-transform shadow-[0_0_0_4px_rgba(0,0,0,0)] group-hover:shadow-[0_0_0_4px_rgba(59,130,246,0.2)]" />
                                <div className="pl-6">
                                    <p className="text-xs text-muted-foreground font-mono mb-0.5">10:3{i} AM</p>
                                    <p className="text-sm font-medium group-hover:text-primary transition-colors text-foreground leading-tight">
                                        {i % 2 === 0 ? "王经理 审批通过了 REQ-9821" : "张三 提交了新的埋点变更"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2 bg-muted/10 p-2 rounded-lg border border-border/50 line-clamp-2">
                                        变更内容涉及 {i * 3} 个事件属性的修改，请相关人员注意查看...
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
