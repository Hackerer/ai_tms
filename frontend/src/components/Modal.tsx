import { X, CheckCircle2, Send, Link as LinkIcon, Users } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewEventModal } from './NewEventModal';
import { NewParameterModal } from './NewParameterModal';
import { NewPageModal } from './NewPageModal';

const NewRequestModal = () => {
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

export const Modal = () => {
    const { activeModal, closeModal } = useUI();

    if (!activeModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={closeModal}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-2xl glass-card rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-white/20">
                <button
                    onClick={closeModal}
                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-50 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>

                {activeModal === 'NEW_REQUEST' && <NewRequestModal />}
                {activeModal === 'NEW_EVENT' && <NewEventModal />}
                {activeModal === 'NEW_PARAMETER' && <NewParameterModal />}
                {activeModal === 'NEW_PAGE' && <NewPageModal />}
                {activeModal === 'USER_JOURNEY_DEMO' && (
                    <div className="p-8 text-center child-transition">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">交互效果验证</h3>
                        <p className="text-muted-foreground text-sm mb-8">
                            您刚才点击了界面上的交互元素。在最终版本中，这里将对接后端逻辑或下钻至深度详情。
                        </p>
                        <button onClick={closeModal} className="px-8 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                            已知晓
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
