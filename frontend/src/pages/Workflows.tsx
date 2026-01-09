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
            className="card-standard p-5 mb-4 group cursor-pointer relative overflow-visible"
            onClick={() => navigate(`/workbench/${request.id}`)}
        >
            <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono font-medium text-muted">{request.id}</span>
                <button
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-container text-muted transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); showToast('Show options...'); }}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
            <h4 className="text-sm font-bold mb-4 text-foreground leading-snug group-hover:text-primary transition-colors pr-2">
                {request.title}
            </h4>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
                        {request.author.charAt(0)}
                    </div>
                </div>
                <div className="text-[10px] font-bold text-muted bg-surface-container px-2 py-1 rounded-md">
                    Oct 24
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({ title, status, requests, icon: Icon, color }: any) => {
    return (
        <div className="flex flex-col min-w-[300px] w-[300px] xl:w-[340px] shrink-0 select-none">
            <div className="flex items-center justify-between mb-6 pl-1">
                <div className="flex items-center gap-2.5">
                    <div className={cn("p-2 rounded-xl bg-surface-container-lowest shadow-sm", color.replace('text-', 'text-opacity-80 text-'))}>
                        <Icon className={cn("w-4 h-4", color)} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-black tracking-tight text-foreground">{title}</h3>
                        <span className="text-[10px] font-medium text-muted">{requests.length} requests</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {requests.map((req: any) => (
                    <KanbanCard key={req.id} request={req} />
                ))}

                {status === 'DRAFT' && (
                    <button className="w-full py-4 border-2 border-dashed border-border/60 rounded-2xl text-muted hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-2 group mb-4">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold">New Draft</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export const Workflows = () => {
    const { openModal } = useUI();

    const allRequests = [
        { id: 'REQ-01', title: 'Payment Funnel Optimization', author: 'Alex', status: 'REVIEWING' },
        { id: 'REQ-02', title: 'New Year Campaign Homepage Tracking', author: 'Sarah', status: 'APPROVED' },
        { id: 'REQ-03', title: 'Login Drop-off Study: Parameter Renaming', author: 'Mike', status: 'APPLIED' },
        { id: 'REQ-04', title: 'Search Result Ranking Algorithm Tracker', author: 'Lisa', status: 'DRAFT' },
        { id: 'REQ-05', title: 'Shopping Cart: Smart Bundle Exposure', author: 'Alex', status: 'DRAFT' },
        { id: 'REQ-06', title: 'Ad Attribution: Deep Link Auto-mapping', author: 'Mike', status: 'REVIEWING' },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background animate-in fade-in duration-500">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 bg-background z-10 shrink-0">
                <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        Workflows
                        <span className="text-sm font-medium text-muted bg-surface-container px-2 py-1 rounded-lg">Board</span>
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openModal('NEW_REQUEST')}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Workflow</span>
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto px-8 pb-8 pt-2 flex gap-10">
                <KanbanColumn
                    title="Drafts"
                    status="Draft"
                    requests={allRequests.filter(r => r.status === 'DRAFT')}
                    icon={FileDiff}
                    color="text-orange-500"
                />
                <KanbanColumn
                    title="In Review"
                    status="Reviewing"
                    requests={allRequests.filter(r => r.status === 'REVIEWING')}
                    icon={Clock}
                    color="text-blue-500"
                />
                <KanbanColumn
                    title="Approved"
                    status="Approved"
                    requests={allRequests.filter(r => r.status === 'APPROVED')}
                    icon={CheckCircle2}
                    color="text-green-500"
                />
                <KanbanColumn
                    title="Deployed"
                    status="Applied"
                    requests={allRequests.filter(r => r.status === 'APPLIED')}
                    icon={GitPullRequest}
                    color="text-purple-500"
                />
            </div>
        </div>
    );
};
