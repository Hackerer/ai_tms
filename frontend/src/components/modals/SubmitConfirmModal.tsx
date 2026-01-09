import type { EventChange } from '../../types/workflow';

interface SubmitConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    changes: EventChange[];
}

/**
 * 提交确认弹窗
 * 在用户提交需求单进入审批流前，展示变更摘要并确认
 */
export const SubmitConfirmModal = ({ isOpen, onClose, onConfirm, changes }: SubmitConfirmModalProps) => {
    if (!isOpen) return null;

    const newCount = changes.filter(c => c.operation === 'create').length;
    const editCount = changes.filter(c => c.operation === 'edit').length;
    const deleteCount = changes.filter(c => c.operation === 'delete').length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-[500px] card-standard overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-bold">确认提交审批?</h3>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-muted-foreground">本次变更包含:</p>
                    <div className="space-y-2">
                        {newCount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                                <span className="text-sm text-green-400">• 新建事件</span>
                                <span className="text-lg font-bold text-green-400">{newCount} 个</span>
                            </div>
                        )}
                        {editCount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                <span className="text-sm text-blue-400">• 编辑事件</span>
                                <span className="text-lg font-bold text-blue-400">{editCount} 个</span>
                            </div>
                        )}
                        {deleteCount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                <span className="text-sm text-red-400">• 删除事件</span>
                                <span className="text-lg font-bold text-red-400">{deleteCount} 个</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-bold text-primary">审批流程:</span> 数据负责人 → 技术负责人
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
                    >
                        确认提交
                    </button>
                </div>
            </div>
        </div>
    );
};
