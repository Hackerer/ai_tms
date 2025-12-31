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
            <div className="w-[90vw] max-w-6xl h-[85vh] bg-background/95 backdrop-blur-xl rounded-4xl border border-border shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-border/50 bg-muted/5 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Edit3 className="w-5 h-5" />
                            </div>
                            变更对比: {eventDiff.newVersion.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1.5 font-mono ml-14 opacity-70">
                            {eventDiff.eventId} • {eventDiff.newVersion.page}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-muted/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="px-8 py-4 bg-surface-container-low/50 border-b border-border/50 flex items-center gap-8 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">新增参数</span>
                        <span className="text-sm font-bold text-foreground">{stats.added}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">修改参数</span>
                        <span className="text-sm font-bold text-foreground">{stats.modified}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">删除参数</span>
                        <span className="text-sm font-bold text-foreground">{stats.removed}</span>
                    </div>
                    {!hasChanges && (
                        <div className="ml-auto flex items-center gap-2 text-muted-foreground bg-muted/10 px-3 py-1 rounded-full">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">无参数变更</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                {/* Content */}
                <div className="flex-1 overflow-auto p-8 bg-muted/5">
                    <div className="space-y-8">
                        {/* 元数据对比 */}
                        {hasMetadataChanges && (
                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    基本信息变更
                                </h4>
                                <div className="space-y-4">
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
                        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
                            <div className="px-6 py-4 bg-muted/20 border-b border-border">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    参数变更明细
                                </h4>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/5 border-b border-border">
                                        <th className="w-12 px-4 py-3"></th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">参数名</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">旧值</th>
                                        <th className="w-12 px-4 py-3"></th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">新值</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">必填</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {paramDiffs.map((diff, idx) => (
                                        <ParameterDiffRow key={idx} diff={diff} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-border bg-muted/5 flex justify-between items-center shrink-0">
                    <div className="text-xs text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />新增</span>
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" />修改</span>
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />删除</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:shadow-md hover:brightness-110 active:scale-95 transition-all"
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
    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/10">
        <span className="text-xs text-muted-foreground w-24 shrink-0 font-medium">{label}</span>
        <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm line-through text-red-500/70">
                {oldValue || '-'}
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            <div className="flex-1 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-600 font-medium">
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
                return 'bg-green-500/5 border-l-[3px] border-l-green-500';
            case 'removed':
                return 'bg-red-500/5 border-l-[3px] border-l-red-500';
            case 'modified':
                return 'bg-blue-500/5 border-l-[3px] border-l-blue-500';
            default:
                return 'border-l-[3px] border-l-transparent hover:bg-muted/5';
        }
    };

    const getIcon = () => {
        switch (diff.changeType) {
            case 'added':
                return <Plus className="w-4 h-4 text-green-500" />;
            case 'removed':
                return <Minus className="w-4 h-4 text-red-500" />;
            case 'modified':
                return <Edit3 className="w-4 h-4 text-blue-500" />;
            default:
                return null;
        }
    };

    return (
        <tr className={cn("transition-colors", getRowStyle())}>
            <td className="px-4 py-3 align-middle">
                {getIcon()}
            </td>
            <td className="px-4 py-3 align-middle">
                <span className="font-mono text-sm font-bold text-foreground">{diff.key}</span>
            </td>
            <td className="px-4 py-3 align-middle">
                {diff.oldValue ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded border font-bold uppercase",
                                diff.changeType === 'modified' && diff.oldValue.type !== diff.newValue?.type
                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                    : "bg-muted/20 text-muted-foreground border-border"
                            )}>
                                {diff.oldValue.type}
                            </span>
                        </div>
                        <p className={cn(
                            "text-xs",
                            diff.changeType === 'modified' && diff.oldValue.desc !== diff.newValue?.desc
                                ? "text-red-500 line-through opacity-70"
                                : "text-muted-foreground"
                        )}>
                            {diff.oldValue.desc}
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground/30">-</span>
                )}
            </td>
            <td className="px-4 py-3 text-center align-middle">
                {diff.changeType !== 'removed' && diff.changeType !== 'added' && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                )}
            </td>
            <td className="px-4 py-3 align-middle">
                {diff.newValue ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded border font-bold uppercase",
                                diff.changeType === 'added'
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : diff.changeType === 'modified' && diff.oldValue?.type !== diff.newValue.type
                                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                        : "bg-muted/20 text-muted-foreground border-border"
                            )}>
                                {diff.newValue.type}
                            </span>
                        </div>
                        <p className={cn(
                            "text-xs",
                            diff.changeType === 'added'
                                ? "text-green-600 font-medium"
                                : diff.changeType === 'modified' && diff.oldValue?.desc !== diff.newValue.desc
                                    ? "text-blue-600 font-medium"
                                    : "text-muted-foreground"
                        )}>
                            {diff.newValue.desc}
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground/30">-</span>
                )}
            </td>
            <td className="px-4 py-3 text-center align-middle">
                {diff.newValue && (
                    <div className={cn(
                        "w-2.5 h-2.5 rounded-full mx-auto transition-all",
                        diff.newValue.isRequired
                            ? "bg-orange-500 shadow-sm ring-2 ring-orange-500/20"
                            : "bg-muted/20"
                    )} />
                )}
            </td>
        </tr>
    );
};
