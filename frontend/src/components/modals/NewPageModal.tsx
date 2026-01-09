import { CheckCircle2, Layout, Link as LinkIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { cn } from '../../lib/utils';

export const NewPageModal = () => {
    const { closeModal, showToast } = useUI();
    const [name, setName] = useState('');
    const [path, setPath] = useState('');
    const [module, setModule] = useState('交易链路');
    const [parent, setParent] = useState('None');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name) newErrors.name = '页面名称不能为空';
        if (!path) newErrors.path = '路径不能为空';
        else if (!path.startsWith('/')) newErrors.path = '路径必须以 / 开头';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        showToast(`页面 ${name} 已成功发布`, 'success');
        closeModal();
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <Layout className="w-5 h-5 text-primary" />
                    新建应用页面
                </h3>
                <p className="text-xs text-muted-foreground mt-1">在应用树中定义新的页面节点及其对应的路由路径。</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">页面名称</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：订单确认页"
                            className={cn(
                                "w-full bg-background border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2",
                                errors.name ? "border-red-500/50 focus:ring-red-500/20" : "border-border focus:border-primary/50 focus:ring-primary/20"
                            )}
                        />
                        {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> 路由路径 (PATH)
                        </label>
                        <input
                            type="text"
                            value={path}
                            onChange={(e) => setPath(e.target.value)}
                            placeholder="/checkout/confirm"
                            className={cn(
                                "w-full bg-background border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 font-mono",
                                errors.path ? "border-red-500/50 focus:ring-red-500/20" : "border-border focus:border-primary/50 focus:ring-primary/20"
                            )}
                        />
                        {errors.path && <p className="text-[10px] text-red-500 mt-1">{errors.path}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">所属模块</label>
                        <select
                            value={module}
                            onChange={(e) => setModule(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        >
                            <option value="交易链路">交易链路</option>
                            <option value="营销活动">营销活动</option>
                            <option value="用户中心">用户中心</option>
                            <option value="内容社区">内容社区</option>
                            <option value="其他">其他</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">父页面节点（可选）</label>
                        <select
                            value={parent}
                            onChange={(e) => setParent(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        >
                            <option value="None">None (根级页面)</option>
                            <option value="PAGE-001">首页 (PAGE-001)</option>
                            <option value="PAGE-002">商品列表 (PAGE-002)</option>
                            <option value="PAGE-004">购物车 (PAGE-004)</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-tight">自动关联提示</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            新页面创建后将自动同步至资产库供埋点设计者选择，您可以稍后在"埋点映射"中查看。
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-lg bg-muted/10 border border-border text-xs font-medium text-foreground hover:bg-muted/20 transition-colors"
                >
                    取消
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                    <Plus className="w-3.5 h-3.5" />
                    发布页面
                </button>
            </div>
        </div>
    );
};
