import {
    Building2,
    Plus,
    Settings
} from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';

// --- Types ---
interface GroupCardProps {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    appCount: number;
}

const GroupCard = ({ id, name, description, memberCount, appCount }: GroupCardProps) => {
    const navigate = useNavigate();

    return (
        <div
            className="card-standard p-6 cursor-pointer group hover:-translate-y-1"
            onClick={() => navigate(`/team/group/${id}`)}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Building2 className="w-5 h-5" />
                </div>
                <button
                    className="p-2 rounded-full hover:bg-surface-container text-muted transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            <h4 className="text-lg font-black tracking-tight mb-2 text-foreground group-hover:text-primary transition-colors">{name}</h4>
            <p className="text-sm text-muted line-clamp-2 mb-6 h-10">{description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{memberCount}</span>
                        <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Members</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{appCount}</span>
                        <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Apps</span>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-surface-container" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const Team = () => {
    const { showToast } = useUI();

    // Mock Group数据
    const groups = [
        { id: 'grp-1', name: 'Transactions', description: 'Managing payment flows, cart analytics and checkout conversion tracking.', memberCount: 12, appCount: 2 },
        { id: 'grp-2', name: 'Growth & Marketing', description: 'Focus on campaigns, referrals, and user acquisition channels.', memberCount: 8, appCount: 1 },
        { id: 'grp-3', name: 'Search Quality', description: 'Search algorithms, result ranking and query analysis metrics.', memberCount: 5, appCount: 3 },
        { id: 'grp-4', name: 'Infrastructure', description: 'Core SDKs, common parameters and data pipeline stability.', memberCount: 4, appCount: 5 },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background animate-in fade-in duration-700">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 bg-background sticky top-0 z-10">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Team & Settings</h2>
                </div>
                <button
                    onClick={() => showToast('Create Group功能开发中...', 'info')}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Group</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {groups.map(group => (
                            <GroupCard key={group.id} {...group} />
                        ))}
                        <div
                            className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group h-full min-h-[240px]"
                            onClick={() => showToast('Create Group功能开发中...', 'info')}
                        >
                            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold">Create New Group</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
