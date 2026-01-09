import {
    ArrowLeft,
    Users,
    Package,
    Settings,
    UserPlus,
    Shield,
    Eye,
    User,
    MoreVertical
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useUI } from '../context/UIContext';
import { EditGroupRoleModal } from '../components/modals/EditGroupRoleModal';
import { InviteMemberModal } from '../components/modals/InviteMemberModal';

// --- Types ---
interface GroupMember {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Reviewer' | 'Member';
    status: 'Active' | 'Offline';
    avatar?: string;
    joinedAt: string;
}

interface Group {
    id: string;
    name: string;
    description: string;
    members: GroupMember[];
    appCount: number;
}

// 角色配置
const roleConfig = {
    Admin: {
        label: 'Admin',
        description: '审核 + 查看 + 管理成员',
        color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        icon: Shield
    },
    Reviewer: {
        label: 'Reviewer',
        description: '审核 + 查看',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: Eye
    },
    Member: {
        label: 'Member',
        description: '仅查看',
        color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
        icon: User
    }
};

export const GroupDetail = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { showToast } = useUI();

    // Mock数据
    const [group, setGroup] = useState<Group>({
        id: groupId || '',
        name: 'Transactions',
        description: 'Managing payment flows, cart analytics and checkout conversion tracking.',
        appCount: 2,
        members: [
            { id: 'm-1', name: 'Alex Chen', email: 'alex.c@nexus.com', role: 'Admin', status: 'Active', joinedAt: '2024-01-15' },
            { id: 'm-2', name: 'Sarah Zhao', email: 'sarah.z@nexus.com', role: 'Reviewer', status: 'Active', joinedAt: '2024-02-20' },
            { id: 'm-3', name: 'Mike Sun', email: 'mike.s@nexus.com', role: 'Reviewer', status: 'Offline', joinedAt: '2024-03-10' },
            { id: 'm-4', name: 'Lisa Li', email: 'lisa.l@nexus.com', role: 'Member', status: 'Active', joinedAt: '2024-04-05' },
        ]
    });

    const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const handleEditRole = (member: GroupMember) => {
        setSelectedMember(member);
        setIsEditRoleModalOpen(true);
    };

    const handleSaveRole = (newRole: 'Admin' | 'Reviewer' | 'Member') => {
        if (!selectedMember) return;

        setGroup(prev => ({
            ...prev,
            members: prev.members.map(m =>
                m.id === selectedMember.id ? { ...m, role: newRole } : m
            )
        }));
        showToast(`已将 ${selectedMember.name} 的角色更新为 ${newRole}`, 'success');
        setIsEditRoleModalOpen(false);
    };

    const handleRemoveMember = (memberId: string) => {
        const member = group.members.find(m => m.id === memberId);
        setGroup(prev => ({
            ...prev,
            members: prev.members.filter(m => m.id !== memberId)
        }));
        showToast(`已将 ${member?.name} 从 ${group.name} 移除`, 'success');
    };

    const handleInviteMember = (memberData: { name: string; email: string; role: 'Admin' | 'Reviewer' | 'Member' }) => {
        const newMember: GroupMember = {
            id: `m-${Date.now()}`,
            name: memberData.name,
            email: memberData.email,
            role: memberData.role,
            status: 'Active',
            joinedAt: new Date().toISOString().split('T')[0]
        };

        setGroup(prev => ({
            ...prev,
            members: [...prev.members, newMember]
        }));

        showToast(`已邀请 ${memberData.name} 加入 ${group.name}，角色为 ${memberData.role}`, 'success');
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background animate-in fade-in duration-700">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 bg-background border-b border-border/40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/team')}
                        className="p-2 rounded-lg hover:bg-surface-container transition-colors text-muted hover:text-foreground"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">{group.name}</h2>
                        <p className="text-sm text-muted">{group.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6 px-4 py-2 rounded-lg bg-surface-container/50">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted" />
                            <span className="text-sm font-bold">{group.members.length} Members</span>
                        </div>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted" />
                            <span className="text-sm font-bold">{group.appCount} Apps</span>
                        </div>
                    </div>
                    <button
                        onClick={() => showToast('Group Settings功能开发中...', 'info')}
                        className="p-2 rounded-lg hover:bg-surface-container transition-colors text-muted hover:text-foreground"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-8 py-4 flex items-center justify-between border-b border-border/40">
                <input
                    type="text"
                    placeholder="搜索成员..."
                    className="px-4 py-2 rounded-lg bg-surface-container border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-80"
                />
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="btn-primary"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Invite Member</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="card-standard p-0 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/40">
                                    <th className="px-6 py-4 text-label">Member</th>
                                    <th className="px-6 py-4 text-label">Role</th>
                                    <th className="px-6 py-4 text-label">Status</th>
                                    <th className="px-6 py-4 text-label">Joined</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {group.members.map(member => {
                                    const config = roleConfig[member.role];
                                    const Icon = config.icon;

                                    return (
                                        <tr
                                            key={member.id}
                                            className="list-row group h-16 cursor-pointer"
                                            onClick={() => handleEditRole(member)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground shadow-sm">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{member.name}</span>
                                                        <span className="text-xs text-muted">{member.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border", config.color)}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-semibold">{config.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <div className={cn("w-2 h-2 rounded-full", member.status === 'Active' ? "bg-green-500" : "bg-gray-400")} />
                                                    <span className={cn("text-xs font-semibold", member.status === 'Active' ? "text-green-600" : "text-muted")}>
                                                        {member.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-muted">{member.joinedAt}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    className="p-2 rounded-full hover:bg-surface-container text-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        showToast('More actions...', 'info');
                                                    }}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* EditGroupRoleModal */}
            {selectedMember && (
                <EditGroupRoleModal
                    isOpen={isEditRoleModalOpen}
                    onClose={() => setIsEditRoleModalOpen(false)}
                    memberName={selectedMember.name}
                    memberEmail={selectedMember.email}
                    currentRole={selectedMember.role}
                    groupName={group.name}
                    onSave={handleSaveRole}
                />
            )}

            {/* InviteMemberModal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                groupName={group.name}
                onInvite={handleInviteMember}
            />
        </div>
    );
};
