import { ListPlus } from 'lucide-react';
import { useState } from 'react';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';

export const NewParameterModal = () => {
    const { closeModal, showToast } = useUI();
    const [name, setName] = useState('');
    const [type, setType] = useState('String');
    const [category, setCategory] = useState('Product');
    const [description, setDescription] = useState('');
    const [isRequired, setIsRequired] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        showToast(`全局参数 ${name} 已添加至参数池`, 'success');
        closeModal();
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <ListPlus className="w-5 h-5 text-primary" />
                    新建全局参数
                </h3>
                <p className="text-xs text-muted-foreground mt-1">定义的参数可在多个埋点事件中复用，保持命名一致性。</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">参数键名 (Parameter Key)</label>
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
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">业务分类</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    >
                        <option>User (用户属性)</option>
                        <option>Product (商品/业务属性)</option>
                        <option>Page (页面属性)</option>
                        <option>System (系统/设备属性)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">描述说明</label>
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

            <div className="flex justify-end gap-3 pt-4">
                <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                >
                    取消
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-8 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-3.5 h-3.5" />
                    创建参数
                </button>
            </div>
        </div>
    );
};

const Plus = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
