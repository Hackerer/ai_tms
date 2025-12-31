import { X, ArrowRight, Plus, Minus, Edit3, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { WorkflowParameter as Parameter } from '../../types/workflow';


// 变更类型
type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

// 参数变更项
interface ParameterDiff {
    key: string;
    changeType: ChangeType;
    oldValue?: Parameter;
    newValue?: Parameter;
}

// 事件变更数据
interface EventDiff {
    eventId: string;
    eventName: string;
    oldVersion?: {
        name: string;
        description: string;
        event_type: string;
        page: string;
        parameters: Parameter[];
    };
    newVersion: {
        name: string;
        description: string;
        event_type: string;
        page: string;
        parameters: Parameter[];
    };
}

// Diff 视图模态框
export const EventDiffModal = ({ isOpen, onClose, eventDiff }: {
    isOpen: boolean;
    onClose: () => void;
    eventDiff: EventDiff | null;
}) => {
    if (!isOpen || !eventDiff) return null;

    // 计算参数变更
    const calculateParameterDiffs = (): ParameterDiff[] => {
        const diffs: ParameterDiff[] = [];
        const oldParams = eventDiff.oldVersion?.parameters || [];
        const newParams = eventDiff.newVersion.parameters;

        const oldParamMap = new Map(oldParams.map(p => [p.key, p]));
        const newParamMap = new Map(newParams.map(p => [p.key, p]));

        // 检查新增和修改
        newParams.forEach(newParam => {
            const oldParam = oldParamMap.get(newParam.key);
            if (!oldParam) {
                diffs.push({
                    key: newParam.key,
                    changeType: 'added',
                    newValue: newParam
                });
            } else {
                const isModified =
                    oldParam.type !== newParam.type ||
                    oldParam.desc !== newParam.desc ||
                    oldParam.isRequired !== newParam.isRequired;

                diffs.push({
                    key: newParam.key,
                    changeType: isModified ? 'modified' : 'unchanged',
                    oldValue: oldParam,
                    newValue: newParam
                });
            }
        });

        // 检查删除
        oldParams.forEach(oldParam => {
            if (!newParamMap.has(oldParam.key)) {
                diffs.push({
                    key: oldParam.key,
                    changeType: 'removed',
                    oldValue: oldParam
                });
            }
        });

        return diffs;
    };

    const paramDiffs = calculateParameterDiffs();
    const hasChanges = paramDiffs.some(d => d.changeType !== 'unchanged');

    // 统计变更
    const stats = {
        added: paramDiffs.filter(d => d.changeType === 'added').length,
        modified: paramDiffs.filter(d => d.changeType === 'modified').length,
        removed: paramDiffs.filter(d => d.changeType === 'removed').length,
    };

    // 元数据变更检测
    const metadataChanges = {
        name: eventDiff.oldVersion?.name !== eventDiff.newVersion.name,
        description: eventDiff.oldVersion?.description !== eventDiff.newVersion.description,
        event_type: eventDiff.oldVersion?.event_type !== eventDiff.newVersion.event_type,
        page: eventDiff.oldVersion?.page !== eventDiff.newVersion.page,
    };

    const hasMetadataChanges = Object.values(metadataChanges).some(v => v);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-[90vw] max-w-6xl h-[85vh] glass-card rounded-2xl border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Edit3 className="w-5 h-5 text-primary" />
                            变更对比: {eventDiff.newVersion.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {eventDiff.eventId} • {eventDiff.newVersion.page}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="px-6 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-6 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs text-muted-foreground">新增参数</span>
                        <span className="text-sm font-bold text-green-400">{stats.added}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-xs text-muted-foreground">修改参数</span>
                        <span className="text-sm font-bold text-blue-400">{stats.modified}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-xs text-muted-foreground">删除参数</span>
                        <span className="text-sm font-bold text-red-400">{stats.removed}</span>
                    </div>
                    {!hasChanges && (
                        <div className="ml-auto flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs">无参数变更</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-6">
                        {/* 元数据对比 */}
                        {hasMetadataChanges && (
                            <div className="glass-card p-6 rounded-xl border-white/[0.05]">
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    基本信息变更
                                </h4>
                                <div className="space-y-3">
                                    {metadataChanges.name && (
                                        <MetadataRow
                                            label="事件名称"
                                            oldValue={eventDiff.oldVersion?.name}
                                            newValue={eventDiff.newVersion.name}
                                        />
                                    )}
                                    {metadataChanges.description && (
                                        <MetadataRow
                                            label="业务描述"
                                            oldValue={eventDiff.oldVersion?.description}
                                            newValue={eventDiff.newVersion.description}
                                        />
                                    )}
                                    {metadataChanges.event_type && (
                                        <MetadataRow
                                            label="事件类型"
                                            oldValue={eventDiff.oldVersion?.event_type}
                                            newValue={eventDiff.newVersion.event_type}
                                        />
                                    )}
                                    {metadataChanges.page && (
                                        <MetadataRow
                                            label="所属页面"
                                            oldValue={eventDiff.oldVersion?.page}
                                            newValue={eventDiff.newVersion.page}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 参数对比表格 */}
                        <div className="glass-card rounded-xl overflow-hidden border-white/[0.05]">
                            <div className="px-6 py-4 bg-white/5 border-b border-white/10">
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    参数变更明细
                                </h4>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="w-12 px-4 py-3"></th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">参数名</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">旧值</th>
                                        <th className="w-12 px-4 py-3"></th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">新值</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">必填</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paramDiffs.map((diff, idx) => (
                                        <ParameterDiffRow key={idx} diff={diff} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-between items-center shrink-0">
                    <div className="text-xs text-muted-foreground">
                        💡 绿色表示新增,蓝色表示修改,红色表示删除
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-95 transition-all"
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
};

// 元数据行组件
const MetadataRow = ({ label, oldValue, newValue }: {
    label: string;
    oldValue?: string;
    newValue: string;
}) => (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02]">
        <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
        <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 px-3 py-2 rounded bg-red-500/10 border border-red-500/20 text-sm line-through text-red-400">
                {oldValue || '-'}
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 px-3 py-2 rounded bg-green-500/10 border border-green-500/20 text-sm text-green-400 font-medium">
                {newValue}
            </div>
        </div>
    </div>
);

// 参数 Diff 行组件
const ParameterDiffRow = ({ diff }: { diff: ParameterDiff }) => {
    const getRowStyle = () => {
        switch (diff.changeType) {
            case 'added':
                return 'bg-green-500/5 border-l-2 border-green-500';
            case 'removed':
                return 'bg-red-500/5 border-l-2 border-red-500';
            case 'modified':
                return 'bg-blue-500/5 border-l-2 border-blue-500';
            default:
                return '';
        }
    };

    const getIcon = () => {
        switch (diff.changeType) {
            case 'added':
                return <Plus className="w-4 h-4 text-green-400" />;
            case 'removed':
                return <Minus className="w-4 h-4 text-red-400" />;
            case 'modified':
                return <Edit3 className="w-4 h-4 text-blue-400" />;
            default:
                return null;
        }
    };

    return (
        <tr className={cn("transition-colors", getRowStyle())}>
            <td className="px-4 py-3">
                {getIcon()}
            </td>
            <td className="px-4 py-3">
                <span className="font-mono text-sm font-bold">{diff.key}</span>
            </td>
            <td className="px-4 py-3">
                {diff.oldValue ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded border font-bold uppercase",
                                diff.changeType === 'modified' && diff.oldValue.type !== diff.newValue?.type
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-white/5 text-muted-foreground border-white/10"
                            )}>
                                {diff.oldValue.type}
                            </span>
                        </div>
                        <p className={cn(
                            "text-xs",
                            diff.changeType === 'modified' && diff.oldValue.desc !== diff.newValue?.desc
                                ? "text-red-400 line-through"
                                : "text-muted-foreground"
                        )}>
                            {diff.oldValue.desc}
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                )}
            </td>
            <td className="px-4 py-3 text-center">
                {diff.changeType !== 'removed' && diff.changeType !== 'added' && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                )}
            </td>
            <td className="px-4 py-3">
                {diff.newValue ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded border font-bold uppercase",
                                diff.changeType === 'added'
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : diff.changeType === 'modified' && diff.oldValue?.type !== diff.newValue.type
                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        : "bg-white/5 text-muted-foreground border-white/10"
                            )}>
                                {diff.newValue.type}
                            </span>
                        </div>
                        <p className={cn(
                            "text-xs",
                            diff.changeType === 'added'
                                ? "text-green-400 font-medium"
                                : diff.changeType === 'modified' && diff.oldValue?.desc !== diff.newValue.desc
                                    ? "text-blue-400 font-medium"
                                    : "text-muted-foreground"
                        )}>
                            {diff.newValue.desc}
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                )}
            </td>
            <td className="px-4 py-3 text-center">
                {diff.newValue && (
                    <div className={cn(
                        "w-2 h-2 rounded-full mx-auto",
                        diff.newValue.isRequired
                            ? "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]"
                            : "bg-white/10"
                    )} />
                )}
            </td>
        </tr>
    );
};
