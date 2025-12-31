import { useState } from 'react';
import { Send, Link as LinkIcon, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { cn } from '../../lib/utils';

export const NewRequestModal = () => {
    const { closeModal, showToast } = useUI();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [docUrl, setDocUrl] = useState('');
    const [group, setGroup] = useState('交易链路组');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title) newErrors.title = '需求标题不能为空';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = () => {
        if (!validate()) return;

        const newId = `REQ-${Date.now().toString().slice(-4)}`;
        showToast(`需求单 ${newId} 已创建成功，正在跳转...`, 'success');
        closeModal();
        navigate(`/workbench/${newId}`);
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    发起新的埋点需求
                </h3>
                <p className="text-xs text-muted-foreground mt-1">请遵循团队埋点规范，确保参数命名一致性。</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">需求名称 (Requirement Title)</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="例如：2025Q1 支付漏斗优化"
                        className={cn(
                            "w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2",
                            errors.title ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-primary/20"
                        )}
                    />
                    {errors.title && <p className="text-[10px] text-red-400 mt-1">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> 需求文档 URL (Optional)
                    </label>
                    <input
                        type="text"
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        placeholder="https://wiki.company.com/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3" /> 协作组
                    </label>
                    <select
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    >
                        <option>交易链路组</option>
                        <option>营销增长组</option>
                        <option>用户中心组</option>
                    </select>
                </div>
            </div>

            <button
                onClick={handleCreate}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 mt-4 hover:brightness-110 active:scale-95 transition-all"
            >
                <CheckCircle2 className="w-4 h-4" />
                提交并进入工作台
            </button>
        </div>
    );
};
