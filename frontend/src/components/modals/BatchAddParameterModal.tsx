import { useState, useEffect } from 'react';
import { Layers, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
// Assuming we have a base Modal or Portal? 
// Wait, Workbench uses SubmitConfirmModal which likely uses a Dialogue or Portal.
// Let's check SubmitConfirmModal imports in a bit. But for now I'll implement it as a standard Modal like NewParameterModal but controlled.
// Actually, NewParameterModal seemingly renders content? 
// Let's use the pattern from SubmitConfirmModal.
// Wait, I haven't seen SubmitConfirmModal code.
// I'll assume it's a standard Modal logic.
// I will use a simple fixed overlay for now if Modal component is not standard.
// But wait, step 1604 showed `Modal.tsx`. I should use it.

import type { WorkflowParameter } from '../../types/workflow';

interface BatchAddParameterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (param: WorkflowParameter) => void;
    selectedCount: number;
}

export const BatchAddParameterModal = ({ isOpen, onClose, onConfirm, selectedCount }: BatchAddParameterModalProps) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('String');
    const [desc, setDesc] = useState('');
    const [isRequired, setIsRequired] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setName('');
            setType('String');
            setDesc('');
            setIsRequired(false);
            setErrors({});
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name) newErrors.name = '参数键名不能为空';
        else if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
            newErrors.name = '只能包含小写字母、数字和下划线';
        }
        if (!desc) newErrors.desc = '描述不能为空';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onConfirm({
            key: name,
            type,
            desc,
            isRequired
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            批量添加参数
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            为选中的 <span className="text-primary font-bold">{selectedCount}</span> 个事件添加统一参数
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">参数键名 (Key)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. page_source"
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
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">描述说明</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="参数业务含义描述..."
                            rows={3}
                            className={cn(
                                "w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2",
                                errors.desc ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/20"
                            )}
                        />
                        {errors.desc && <p className="text-[10px] text-red-400 mt-1">{errors.desc}</p>}
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <input
                            type="checkbox"
                            id="batch-required"
                            checked={isRequired}
                            onChange={(e) => setIsRequired(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary focus:ring-0 focus:ring-offset-0"
                        />
                        <label htmlFor="batch-required" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">
                            设为必填参数 (Required)
                        </label>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        批量应用
                    </button>
                </div>
            </div>
        </div>
    );
};
