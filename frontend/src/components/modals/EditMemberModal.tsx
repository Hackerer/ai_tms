import { useState } from 'react';
import { X, Shield, Eye, User, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- Types ---
export interface MemberData {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Reviewer' | 'Member';
    status: 'Active' | 'Offline';
    avatar?: string;
}

interface EditMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: MemberData | null;
    onSave: (updatedMember: MemberData) => void;
    onDelete: (memberId: string) => void;
    currentUserRole: 'Admin' | 'Reviewer' | 'Member';
}

// 角色配置
const roleConfig = {
    Admin: {
        label: 'Admin',
        color: 'bg-orange-500/10 text-orange-600',
        icon: Shield,
        description: '可以审核、查看并管理所有成员和角色'
    },
    Reviewer: {
        label: 'Reviewer',
        color: 'bg-blue-500/10 text-blue-600',
        icon: Eye,
        description: '可以审核需求和变更，查看所有内容'
    },
    Member: {
        label: 'Member',
        color: 'bg-gray-500/10 text-gray-600',
        icon: User,
        description: '普通成员，可以查看内容'
    }
};

export const EditMemberModal = ({
    isOpen,
    onClose,
    member,
    onSave,
    onDelete,
    currentUserRole
}: EditMemberModalProps) => {
    const [editedMember, setEditedMember] = useState<MemberData | null>(member);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // 权限控制：只有Admin可以编辑
    const canEdit = currentUserRole === 'Admin';

    if (!isOpen || !member) return null;

    // 初始化编辑状态
    if (editedMember?.id !== member.id) {
        setEditedMember(member);
    }

    const handleSave = () => {
        if (editedMember) {
            onSave(editedMember);
        }
    };

    const handleDelete = () => {
        if (member) {
            onDelete(member.id);
            setShowDeleteConfirm(false);
        }
    };

    const RoleIcon = editedMember ? roleConfig[editedMember.role].icon : User;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[200] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="card-standard w-full max-w-md p-0 pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground shadow-sm">
                                {member.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    {canEdit ? '编辑成员' : '成员详情'}
                                </h3>
                                <p className="text-xs text-muted">{member.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-surface-container text-muted hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* 成员信息 */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                                    姓名
                                </label>
                                <div className="text-sm font-medium text-foreground">
                                    {member.name}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                                    邮箱
                                </label>
                                <div className="text-sm text-foreground">
                                    {member.email}
                                </div>
                            </div>

                            {/* 角色选择 */}
                            <div>
                                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                                    角色
                                </label>
                                {canEdit ? (
                                    <div className="space-y-2">
                                        {(['Admin', 'Reviewer', 'Member'] as const).map((role) => {
                                            const config = roleConfig[role];
                                            const Icon = config.icon;
                                            return (
                                                <button
                                                    key={role}
                                                    onClick={() => setEditedMember({ ...editedMember!, role })}
                                                    className={cn(
                                                        "w-full p-3 rounded-lg border-2 transition-all text-left",
                                                        editedMember?.role === role
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-border-hover hover:bg-surface-container"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn("p-1.5 rounded-md mt-0.5", config.color)}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-bold text-foreground">
                                                                    {config.label}
                                                                </span>
                                                                {editedMember?.role === role && (
                                                                    <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                                                                        当前
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted">
                                                                {config.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className={cn("p-1.5 rounded-md", roleConfig[member.role].color)}>
                                            <RoleIcon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {roleConfig[member.role].label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 状态切换 */}
                            <div>
                                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                                    状态
                                </label>
                                {canEdit ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditedMember({ ...editedMember!, status: 'Active' })}
                                            className={cn(
                                                "flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                                                editedMember?.status === 'Active'
                                                    ? "border-green-500 bg-green-500/10 text-green-600"
                                                    : "border-border hover:border-border-hover text-muted"
                                            )}
                                        >
                                            Active
                                        </button>
                                        <button
                                            onClick={() => setEditedMember({ ...editedMember!, status: 'Offline' })}
                                            className={cn(
                                                "flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                                                editedMember?.status === 'Offline'
                                                    ? "border-gray-500 bg-gray-500/10 text-gray-600"
                                                    : "border-border hover:border-border-hover text-muted"
                                            )}
                                        >
                                            Offline
                                        </button>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5">
                                        <div className={cn("w-2 h-2 rounded-full", member.status === 'Active' ? "bg-green-500" : "bg-gray-400")} />
                                        <span className={cn("text-sm font-semibold", member.status === 'Active' ? "text-green-600" : "text-muted")}>
                                            {member.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 权限提示（非Admin用户） */}
                        {!canEdit && (
                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-600">
                                    您当前是 {roleConfig[currentUserRole].label} 角色，仅可查看成员信息。需要Admin权限才能编辑。
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-surface-container/30 border-t border-border flex items-center justify-between">
                        {canEdit ? (
                            <>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    删除成员
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg border border-border text-xs font-bold text-foreground hover:bg-surface-container transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="btn-primary"
                                    >
                                        保存更改
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className="ml-auto btn-primary"
                            >
                                关闭
                            </button>
                        )}
                    </div>

                    {/* 删除确认对话框 */}
                    {showDeleteConfirm && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center p-6 z-10">
                            <div className="bg-surface-container-lowest rounded-xl p-6 max-w-sm w-full shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-foreground">确认删除</h4>
                                </div>
                                <p className="text-sm text-muted mb-6">
                                    确定要删除成员 <span className="font-bold text-foreground">{member.name}</span> 吗？此操作无法撤销。
                                </p>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 rounded-lg border border-border text-xs font-bold text-foreground hover:bg-surface-container transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                                    >
                                        确认删除
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
