import { Shield, Eye, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface EditGroupRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberName: string;
    memberEmail: string;
    currentRole: 'Admin' | 'Reviewer' | 'Member';
    groupName: string;
    onSave: (newRole: 'Admin' | 'Reviewer' | 'Member') => void;
}

const roleConfig = {
    Admin: {
        label: 'Admin',
        description: '审核 + 查看 + 管理Group成员',
        color: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
        hoverColor: 'hover:border-orange-500/50 hover:bg-orange-500/15',
        selectedColor: 'border-orange-500 bg-orange-500/15',
        icon: Shield
    },
    Reviewer: {
        label: 'Reviewer',
        description: '审核 + 查看',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        hoverColor: 'hover:border-blue-500/50 hover:bg-blue-500/15',
        selectedColor: 'border-blue-500 bg-blue-500/15',
        icon: Eye
    },
    Member: {
        label: 'Member',
        description: '仅查看',
        color: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
        hoverColor: 'hover:border-gray-500/50 hover:bg-gray-500/15',
        selectedColor: 'border-gray-500 bg-gray-500/15',
        icon: User
    }
};

export const EditGroupRoleModal = ({
    isOpen,
    onClose,
    memberName,
    memberEmail,
    currentRole,
    groupName,
    onSave
}: EditGroupRoleModalProps) => {
    const [selectedRole, setSelectedRole] = useState<'Admin' | 'Reviewer' | 'Member'>(currentRole);

    useEffect(() => {
        setSelectedRole(currentRole);
    }, [currentRole, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(selectedRole);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-surface-container-low rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/40">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">编辑成员角色</h3>
                        <p className="text-sm text-muted mt-1">
                            在 <span className="font-medium text-foreground">{groupName}</span> 中的权限
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface-container transition-colors text-muted hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Member Info */}
                <div className="px-6 py-4 bg-surface-container/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-base font-bold text-primary-foreground shadow-sm">
                            {memberName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{memberName}</p>
                            <p className="text-sm text-muted">{memberEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="p-6 space-y-3">
                    <label className="text-sm font-semibold text-foreground block mb-2">
                        选择角色
                    </label>
                    {(['Admin', 'Reviewer', 'Member'] as const).map((role) => {
                        const config = roleConfig[role];
                        const Icon = config.icon;
                        const isSelected = selectedRole === role;

                        return (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setSelectedRole(role)}
                                className={cn(
                                    "w-full p-4 rounded-xl border-2 transition-all text-left",
                                    config.color,
                                    config.hoverColor,
                                    isSelected ? config.selectedColor : "border-border"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg mt-0.5",
                                        isSelected ? config.color : "bg-surface-container"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">{config.label}</span>
                                            {isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted mt-0.5">{config.description}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/40">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-surface-container transition-colors text-sm font-medium"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        disabled={selectedRole === currentRole}
                    >
                        <span>保存更改</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
