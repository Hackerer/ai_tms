import { X, CheckCircle2, ChevronRight } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import { useState } from 'react';

const NewRequestModal = () => {
    const { closeModal, showToast } = useUI();
    const [step, setStep] = useState(1);

    const handleCreate = () => {
        showToast('需求单已创建成功，正在跳转至工作流中心...', 'success');
        closeModal();
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold">发起新的埋点需求</h3>
                    <p className="text-xs text-muted-foreground mt-1">请遵循团队埋点规范，确保参数命名一致性。</p>
                </div>
                <div className="flex items-center gap-1">
                    <div className={cn("w-2 h-2 rounded-full", step >= 1 ? "bg-primary" : "bg-white/10")} />
                    <div className="w-4 h-0.5 bg-white/10" />
                    <div className={cn("w-2 h-2 rounded-full", step >= 2 ? "bg-primary" : "bg-white/10")} />
                </div>
            </div>

            {step === 1 ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">需求名称</label>
                        <input type="text" placeholder="例如：2025Q1 支付漏斗优化" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">协作组</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none">
                            <option>交易链路组</option>
                            <option>营销增长组</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setStep(2)}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4"
                    >
                        下一步: 选择范围
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center">
                        <p className="text-sm text-muted-foreground">此处可从资产库勾选现有埋点或直接录入新字段</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/25"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        提交并进入工作流
                    </button>
                </div>
            )}
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
            <div className="relative w-full max-w-lg glass-card rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-white/20">
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {activeModal === 'NEW_REQUEST' && <NewRequestModal />}
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
