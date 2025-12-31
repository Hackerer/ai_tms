import {
    GitPullRequest,
    Clock,
    CheckCircle2,
    Plus,
    MoreVertical,
    FileDiff
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';

const KanbanCard = ({ request }: any) => {
    const navigate = useNavigate();
    const { showToast } = useUI();

    return (
        <div
            className="glass-card p-4 rounded-xl border-border hover:border-primary/40 transition-all hover:translate-y-[-2px] group cursor-pointer shadow-sm mb-4"
            onClick={() => navigate(`/workbench/${request.id}`)}
        >
            <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono text-muted-foreground">{request.id}</span>
                <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); showToast('更多操作...'); }}>
                    <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
            </div>
            <h4 className="text-sm font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{request.title}</h4>
            <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-border">
                        <span className="text-[8px] font-bold text-primary">{request.author.charAt(0)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{request.author}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <span className="px-1.5 py-0.5 rounded bg-muted/10 border border-border">3</span>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({ title, status, requests, icon: Icon, color }: any) => {
    return (
        <div className="flex flex-col w-80 shrink-0 select-none">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg bg-muted/10", color)}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold tracking-wide uppercase">{title}</h3>
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-muted/10 border border-border text-[10px] font-mono text-muted-foreground">
                        {requests.length}
                    </span>
                </div>
            </div>
            <div className="flex-1 bg-muted/5 border border-border rounded-2xl p-3 overflow-y-auto no-scrollbar min-h-[500px]">
                {requests.map((req: any) => (
                    <KanbanCard key={req.id} request={req} />
                ))}
                {status === 'Draft' && (
                    <button className="w-full py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-foreground/10 hover:text-foreground transition-all flex flex-col items-center gap-1 group">
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold">新建分阶段需求</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export const Workflows = () => {
    const { openModal } = useUI();

    const allRequests = [
        { id: 'REQ-01', title: '2025Q1 支付环节漏斗治理', author: 'Alex', status: 'Reviewing' },
        { id: 'REQ-02', title: '新年大促活动 - 首页会场埋点升级', author: 'Sarah', status: 'Approved' },
        { id: 'REQ-03', title: '登录流失率专项：参数重命名', author: 'Mike', status: 'Applied' },
        { id: 'REQ-04', title: '搜索结果面板 - 排序算法追踪', author: 'Lisa', status: 'Draft' },
        { id: 'REQ-05', title: '购物车改版：新增智能凑单曝光', author: 'Alex', status: 'Draft' },
        { id: 'REQ-06', title: '广告归因：支持 Deep Link 自动映射', author: 'Mike', status: 'Reviewing' },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-md z-10 shadow-sm sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <GitPullRequest className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">工作流中心</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex rounded-lg bg-muted/10 p-1 border border-border">
                        <button className="px-3 py-1 rounded-md bg-background text-xs font-semibold shadow-sm text-foreground">看板</button>
                        <button className="px-3 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground">列表</button>
                    </div>
                    <button
                        onClick={() => openModal('NEW_REQUEST')}
                        className="glass-button px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold border-none flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        新建需求
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/5 via-background to-background flex gap-8">
                <KanbanColumn
                    title="草稿箱"
                    status="Draft"
                    requests={allRequests.filter(r => r.status === 'Draft')}
                    icon={FileDiff}
                    color="text-orange-400"
                />
                <KanbanColumn
                    title="审批中"
                    status="Reviewing"
                    requests={allRequests.filter(r => r.status === 'Reviewing')}
                    icon={Clock}
                    color="text-blue-400"
                />
                <KanbanColumn
                    title="已通过"
                    status="Approved"
                    requests={allRequests.filter(r => r.status === 'Approved')}
                    icon={CheckCircle2}
                    color="text-green-400"
                />
                <KanbanColumn
                    title="已发布"
                    status="Applied"
                    requests={allRequests.filter(r => r.status === 'Applied')}
                    icon={GitPullRequest}
                    color="text-purple-400"
                />
            </div>
        </div>
    );
};
