import {
    TrendingUp,
    Plus,
    Search,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    Library
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { SparkLine } from '../components/SparkLine';

const StatCard = ({ title, value, change, icon: Icon, chartColor, data, onClick }: any) => {
    return (
        <div
            className="card-standard p-6 cursor-pointer group relative overflow-hidden"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                    <span className="text-[10px] font-bold text-green-600">{change}</span>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="text-3xl font-black text-foreground tracking-tight mb-1">{value}</h3>
                <p className="text-xs text-muted font-medium uppercase tracking-wider">{title}</p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                <SparkLine data={data} color={chartColor} height={48} />
            </div>
        </div>
    );
};

const RequestRow = ({ id, asset, status, date, onClick }: any) => {
    return (
        <tr
            className="list-row h-16 group"
            onClick={onClick}
        >
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="text-xs font-mono font-medium text-muted transition-colors group-hover:text-primary">{id}</span>
                    <span className="text-sm font-bold text-foreground mt-0.5">{asset}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    status === 'Approved' ? "bg-green-500/10 text-green-600" :
                        status === 'Reviewing' ? "bg-blue-500/10 text-blue-600" :
                            "bg-gray-500/10 text-gray-500"
                )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full",
                        status === 'Approved' ? "bg-green-500" :
                            status === 'Reviewing' ? "bg-blue-500" :
                                "bg-gray-500"
                    )} />
                    {status}
                </div>
            </td>
            <td className="px-6 py-4 text-xs text-muted font-medium tabular-nums">{date}</td>
            <td className="px-6 py-4 text-right">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-surface-container hover:text-foreground transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
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
        <div className="flex-1 overflow-auto bg-background p-8 lg:p-12 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-display text-3xl md:text-4xl mb-2">My Dashboard</h1>
                    <p className="text-muted text-sm">Overview of your asset ecosystem.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group w-full md:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Type to search..."
                            className="input-standard pl-10 w-full md:w-64 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => openModal('NEW_REQUEST')}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Request</span>
                    </button>
                </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Assets"
                    value="1,284"
                    change="12%"
                    icon={Library}
                    chartColor="var(--chart-1)"
                    data={[10, 25, 40, 30, 45, 50, 48, 60, 55, 70]}
                    onClick={() => navigate('/assets')}
                />
                <StatCard
                    title="New Events"
                    value="156"
                    change="8%"
                    icon={TrendingUp}
                    chartColor="var(--chart-4)"
                    data={[5, 10, 8, 15, 12, 20, 25, 22, 30, 28]}
                    onClick={() => navigate('/assets?filter=thisMonth')}
                />
                <StatCard
                    title="Pending Review"
                    value="23"
                    change="2%"
                    icon={Clock}
                    chartColor="var(--chart-3)"
                    data={[20, 18, 22, 20, 15, 12, 10, 8, 5, 23]}
                    onClick={() => navigate('/workflows?status=reviewing')}
                />
                <StatCard
                    title="System Health"
                    value="98%"
                    change="0%"
                    icon={CheckCircle2}
                    chartColor="var(--chart-2)"
                    data={[90, 92, 91, 94, 95, 96, 95, 97, 98, 98.5]}
                    onClick={() => showToast('All systems operational', 'info')}
                />
            </div>

            {/* Content Area - The "Desk" Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Recent Requests List */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">Recent Requests</h3>
                        <button className="text-xs font-bold uppercase tracking-wider text-muted hover:text-primary transition-colors">
                            View All
                        </button>
                    </div>

                    <div className="card-standard overflow-hidden p-0">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="px-6 py-4 text-label">Asset</th>
                                    <th className="px-6 py-4 text-label">Status</th>
                                    <th className="px-6 py-4 text-label">Date</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                <RequestRow id="REQ-9821" asset="Checkout Flow Analytics" status="Approved" date="Oct 24" onClick={() => navigate('/workbench/REQ-9821')} />
                                <RequestRow id="REQ-9822" asset="Double 11 Campaign" status="Reviewing" date="Oct 23" onClick={() => navigate('/workbench/REQ-9822')} />
                                <RequestRow id="REQ-9823" asset="Login Dropout Study" status="Draft" date="Yesterday" onClick={() => navigate('/workbench/REQ-9823')} />
                                <RequestRow id="REQ-9824" asset="User Profile Update" status="Reviewing" date="Just now" onClick={() => navigate('/workbench/REQ-9824')} />
                                <RequestRow id="REQ-9825" asset="Search Quality Metrics" status="Approved" date="Just now" onClick={() => navigate('/workbench/REQ-9825')} />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Activity Feed */}
                <div className="lg:col-span-4">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">Activity</h3>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>

                    <div className="relative space-y-8 pl-4 before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-px before:bg-border border-l-0">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative pl-8 group cursor-pointer" onClick={() => showToast('View details', 'info')}>
                                <div className="absolute left-[3px] top-1 w-2.5 h-2.5 rounded-full bg-background border-2 border-muted group-hover:border-primary group-hover:scale-125 transition-all z-10" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-mono text-muted mb-1">10:4{i} AM</span>
                                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                        {i % 2 === 0 ? "Alex approved REQ-9821" : "Sarah updated Event Schema"}
                                    </p>
                                    <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                                        Changes pending review for production deployment...
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
