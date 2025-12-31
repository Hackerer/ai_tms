import { ListPlus, HelpCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import { cn } from '../../lib/utils';
import type { WorkflowParameter } from '../../types/workflow';

interface NewParameterModalProps {
    initialKey?: string;
    onConfirm?: (param: WorkflowParameter) => void;
    onClose?: () => void;
    isOpen?: boolean; // Added isOpen
}

export const NewParameterModal = ({ initialKey = '', onConfirm, onClose, isOpen }: NewParameterModalProps) => {
    const { closeModal: contextClose, showToast } = useUI();
    const handleClose = onClose || contextClose;

    // If controlled mode and closed, return null
    if (isOpen === false) return null;

    const [name, setName] = useState(initialKey);
    // ... state ...
    const [type, setType] = useState('String');
    const [category, setCategory] = useState<'global' | 'business'>('global');
    const [description, setDescription] = useState('');
    const [isRequired, setIsRequired] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialKey) setName(initialKey);
    }, [initialKey]);

    // ... validation and handlers ...
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name) newErrors.name = '参数名称不能为空';
        else if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
            newErrors.name = '只能包含小写字母、数字和下划线';
        }
        if (!description) newErrors.description = '描述不能为空';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const newParam: WorkflowParameter = {
            key: name,
            type,
            desc: description,
            isRequired,
            ref_id: `PROP-${Date.now()}`,
            category
        };

        if (onConfirm) {
            onConfirm(newParam);
        } else {
            showToast(`参数 ${name} 已添加至参数池`, 'success');
        }
        handleClose();
    };

    const content = (
        <div className="p-8 space-y-8 bg-background/95 backdrop-blur-xl text-foreground">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <ListPlus className="w-5 h-5" />
                    </div>
                    新建标准参数
                </h3>
                <p className="text-sm text-muted-foreground mt-2 ml-14 opacity-80">
                    定义的参数将自动存入参数池。请正确选择参数的作用域以保持架构整洁。
                </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Scope Selection */}
                <div className="p-1.5 bg-muted/20 rounded-full flex">
                    <button
                        onClick={() => setCategory('global')}
                        className={cn(
                            "flex-1 py-2.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2",
                            category === 'global' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted/30"
                        )}
                    >
                        <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                        Global (公共通用)
                    </button>
                    <button
                        onClick={() => setCategory('business')}
                        className={cn(
                            "flex-1 py-2.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2",
                            category === 'business' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted/30"
                        )}
                    >
                        <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                        Business (业务自定义)
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">参数键名 (Key)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：product_id"
                            className={cn(
                                "w-full h-11 bg-muted/10 border rounded-2xl px-4 text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-muted-foreground/40",
                                errors.name
                                    ? "border-red-500/50 focus:ring-red-500/20 bg-red-500/5"
                                    : "border-border hover:border-primary/30 focus:border-primary/50 focus:ring-primary/20"
                            )}
                        />
                        {errors.name && <p className="text-[10px] text-red-500 font-medium ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">数据类型</label>
                        <div className="relative">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full h-11 bg-muted/10 border border-border hover:border-primary/30 rounded-2xl px-4 text-sm focus:outline-none appearance-none cursor-pointer"
                            >
                                <option>String</option>
                                <option>Number</option>
                                <option>Boolean</option>
                                <option>Object</option>
                                <option>Array</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                <ListPlus className="w-4 h-4 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 flex items-center justify-between">
                        <span>业务描述</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="说明该参数的业务含义和取值规范..."
                        rows={3}
                        className={cn(
                            "w-full bg-muted/10 border rounded-2xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 resize-none placeholder:text-muted-foreground/40",
                            errors.description
                                ? "border-red-500/50 focus:ring-red-500/20 bg-red-500/5"
                                : "border-border hover:border-primary/30 focus:border-primary/50 focus:ring-primary/20"
                        )}
                    />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/10 border border-border/50 hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => setIsRequired(!isRequired)}>
                    <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                        isRequired ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
                    )}>
                        {isRequired && <ListPlus className="w-3.5 h-3.5 rotate-45" />}
                    </div>
                    <label className="text-sm font-medium text-foreground cursor-pointer select-none">
                        默认设为必填 <span className="text-muted-foreground font-normal ml-1">(Required by default)</span>
                    </label>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-full border border-border text-sm font-bold text-muted-foreground hover:bg-muted/20 transition-colors"
                >
                    取消
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-8 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                    <ListPlus className="w-4 h-4" />
                    创建并引用
                </button>
            </div>
        </div>
    );

    // If controlled by prop (isOpen defined), wrap in Overlay
    if (isOpen !== undefined) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={handleClose}
                />
                <div className="relative w-full max-w-2xl bg-background rounded-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-border">
                    {content}
                </div>
            </div>
        );
    }

    // Otherwise return content only (for Modal.tsx usage)
    return content;
};
