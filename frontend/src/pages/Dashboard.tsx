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


const StatCard = ({ title, value, change, icon: Icon, color, onClick }: any) => {
    return (
        <div
            className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div className={cn("p-2 rounded-lg bg-white/5", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {change}
                </span>
            </div>
            <div className="mt-4">
                <p className="text-sm text-muted-foreground">{title}</p>
                <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
            </div>
        </div>
    );
};

const RequestRow = ({ id, asset, status, date, onClick }: any) => {
    return (
        <tr
            className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
            onClick={onClick}
        >
            <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{id}</td>
            <td className="px-6 py-4 text-sm font-medium">{asset}</td>
            <td className="px-6 py-4">
                <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    status === 'Approved' ? "bg-green-500/20 text-green-400" :
                        status === 'Reviewing' ? "bg-blue-500/20 text-blue-400" :
                            "bg-white/10 text-muted-foreground border border-white/10"
                )}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-muted-foreground">{date}</td>
            <td className="px-6 py-4 text-right">
                <button className="p-1 hover:text-primary transition-colors">
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
        <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background p-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">仪表盘概览</h2>
                    <p className="text-muted-foreground mt-1">欢迎回来，实时监控您的埋点数据资产。</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="搜索资产或需求..."
                            onKeyDown={(e) => e.key === 'Enter' && showToast('正在全局检索资产库...', 'info')}
                            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => openModal('NEW_REQUEST')}
                        className="glass-button px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-white bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] border-none"
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
                    color="text-blue-400"
                    onClick={() => navigate('/assets')}
                />
                <StatCard
                    title="本月新增"
                    value="156"
                    change="+8.2%"
                    icon={TrendingUp}
                    color="text-purple-400"
                    onClick={() => navigate('/assets?filter=thisMonth')}
                />
                <StatCard
                    title="待办审批"
                    value="23"
                    change="-2%"
                    icon={Clock}
                    color="text-orange-400"
                    onClick={() => navigate('/workflows?status=reviewing')}
                />
                <StatCard
                    title="已上线"
                    value="98.5%"
                    change="+0.1%"
                    icon={CheckCircle2}
                    color="text-green-400"
                    onClick={() => showToast('查看已上线资产详情', 'info')}
                />
            </div>

            {/* Tables & Activity Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Requests */}
                <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-primary" />
                            最近需求单
                        </h4>
                        <button className="text-xs text-primary hover:underline font-medium">查看全部</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">名称</th>
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">状态</th>
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">更新日期</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <RequestRow id="REQ-9821" asset="2025Q1 数据治理" status="Approved" date="2025-12-28" onClick={() => navigate('/workbench/REQ-9821')} />
                                <RequestRow id="REQ-9822" asset="双十一活动埋点" status="Reviewing" date="2025-12-29" onClick={() => navigate('/workbench/REQ-9822')} />
                                <RequestRow id="REQ-9823" asset="登录流失率专项" status="Draft" date="2025-12-30" onClick={() => navigate('/workbench/REQ-9823')} />
                                <RequestRow id="REQ-9824" asset="新版个人中心埋点" status="Reviewing" date="2025-12-30" onClick={() => navigate('/workbench/REQ-9824')} />
                                <RequestRow id="REQ-9825" asset="搜索质量评估" status="Approved" date="2025-12-30" onClick={() => navigate('/workbench/REQ-9825')} />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Activity Hub */}
                <div className="glass-card rounded-2xl p-6">
                    <h4 className="font-semibold mb-6 text-sm">系统动态</h4>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => showToast('正在跳转至动态详情...', 'info')}>
                                <div className="relative">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform" />
                                    {i !== 4 && <div className="absolute top-4 left-[0.22rem] w-[2px] h-10 bg-white/10" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                        {i % 2 === 0 ? "王经理 审批通过了 REQ-9821" : "张三 提交了新的埋点变更"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">2 小时前</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
