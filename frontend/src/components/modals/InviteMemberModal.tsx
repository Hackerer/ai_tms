import { Shield, Eye, User, X, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupName: string;
    onInvite: (memberData: { name: string; email: string; role: 'Admin' | 'Reviewer' | 'Member' }) => void;
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

export const InviteMemberModal = ({
    isOpen,
    onClose,
    groupName,
    onInvite
}: InviteMemberModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState<'Admin' | 'Reviewer' | 'Member'>('Member');
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

    const resetForm = () => {
        setName('');
        setEmail('');
        setSelectedRole('Member');
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateForm = () => {
        const newErrors: { name?: string; email?: string } = {};

        if (!name.trim()) {
            newErrors.name = '请输入姓名';
        }

        if (!email.trim()) {
            newErrors.email = '请输入邮箱';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = '邮箱格式不正确';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInvite = () => {
        if (!validateForm()) return;

        onInvite({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role: selectedRole
        });

        handleClose();
    };

    if (!isOpen) return null;

    const isFormValid = name.trim() && email.trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-surface-container-low rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/40">
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            邀请成员
                        </h3>
                        <p className="text-sm text-muted mt-1">
                            邀请成员加入 <span className="font-medium text-foreground">{groupName}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-surface-container transition-colors text-muted hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="text-sm font-semibold text-foreground block mb-2">
                            姓名 <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            placeholder="例如：张三"
                            className={cn(
                                "w-full px-4 py-2.5 rounded-lg border bg-surface-container transition-colors",
                                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                "text-sm text-foreground placeholder:text-muted",
                                errors.name ? "border-destructive" : "border-border"
                            )}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="text-sm font-semibold text-foreground block mb-2">
                            邮箱 <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            placeholder="例如：zhangsan@company.com"
                            className={cn(
                                "w-full px-4 py-2.5 rounded-lg border bg-surface-container transition-colors",
                                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                "text-sm text-foreground placeholder:text-muted",
                                errors.email ? "border-destructive" : "border-border"
                            )}
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="text-sm font-semibold text-foreground block mb-2">
                            角色
                        </label>
                        <div className="space-y-2">
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
                                            "w-full p-3 rounded-lg border-2 transition-all text-left",
                                            config.color,
                                            config.hoverColor,
                                            isSelected ? config.selectedColor : "border-border"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                isSelected ? config.color : "bg-surface-container"
                                            )}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-foreground">{config.label}</span>
                                                    {isSelected && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted mt-0.5">{config.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/40">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-surface-container transition-colors text-sm font-medium"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleInvite}
                        className="btn-primary"
                        disabled={!isFormValid}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>发送邀请</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
