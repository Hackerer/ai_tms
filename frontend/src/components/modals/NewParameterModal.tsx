import { ListPlus, HelpCircle } from 'lucide-react';
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
        <div className="p-8 space-y-6 bg-[#0A0A0A] text-foreground">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <ListPlus className="w-5 h-5 text-primary" />
                    新建标准参数
                </h3>
                {/* ... same header ... */}
                <p className="text-xs text-muted-foreground mt-1">
                    定义的参数将自动存入参数池。请正确选择参数的作用域以保持架构整洁。
                </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
                {/* Scope Selection */}
                <div className="p-1 bg-white/5 rounded-xl flex">
                    <button
                        onClick={() => setCategory('global')}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                            category === 'global' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        Global (公共通用)
                    </button>
                    <button
                        onClick={() => setCategory('business')}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                            category === 'business' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        Business (业务自定义)
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">参数键名 (Key)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：product_id"
                            className={cn(
                                "w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2",
                                errors.name ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/20"
                            )}
                        />
                        {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">数据类型</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                        >
                            <option>String</option>
                            <option>Number</option>
                            <option>Boolean</option>
                            <option>Object</option>
                            <option>Array</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                        <span>业务描述</span>
                        <div className="group relative cursor-help">
                            <HelpCircle className="w-3 h-3 text-muted-foreground" />
                            <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-black border border-white/20 rounded shadow-xl text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                准确的描述有助于其他同学复用此参数，请勿填写无意义的字符。
                            </div>
                        </div>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="说明该参数的业务含义和取值规范..."
                        rows={3}
                        className={cn(
                            "w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2",
                            errors.description ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/20"
                        )}
                    />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input
                        type="checkbox"
                        id="required"
                        checked={isRequired}
                        onChange={(e) => setIsRequired(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary focus:ring-0 focus:ring-offset-0"
                    />
                    <label htmlFor="required" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">
                        默认设为必填 (Required by default)
                    </label>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                >
                    取消
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-8 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                    <ListPlus className="w-3.5 h-3.5" />
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
                <div className="relative w-full max-w-2xl glass-card rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-white/20">
                    {content}
                </div>
            </div>
        );
    }

    // Otherwise return content only (for Modal.tsx usage)
    return content;
};
