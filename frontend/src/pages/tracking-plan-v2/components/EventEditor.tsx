import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, Layers, Copy, Eye } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { TrackingEvent, TrackingParameter, ParameterType } from '../types/schema';
import { EventScreenshot } from '../../../components/EventScreenshot';

interface EventEditorProps {
    events: TrackingEvent[];
    onChange: (events: TrackingEvent[]) => void;
    onCopy?: (index: number) => void;
    onViewDiff?: (event: TrackingEvent) => void;
}

/**
 * ParameterRow - 单个参数编辑行
 */
const ParameterRow: React.FC<{
    parameter: TrackingParameter;
    onUpdate: (updates: Partial<TrackingParameter>) => void;
    onDelete: () => void;
}> = ({ parameter, onUpdate, onDelete }) => {
    return (
        <div className="group flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-transparent hover:border-border transition-all">
            <div className="flex-1 grid grid-cols-12 gap-3">
                {/* 标识符 */}
                <div className="col-span-4">
                    <input
                        value={parameter.identifier}
                        onChange={(e) => onUpdate({ identifier: e.target.value })}
                        placeholder="参数标识符 (e.g. user_id)"
                        className="w-full bg-transparent text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                    />
                </div>
                {/* 名称 */}
                <div className="col-span-3">
                    <input
                        value={parameter.name}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        placeholder="显示名称"
                        className="w-full bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                    />
                </div>
                {/* 类型选择 */}
                <div className="col-span-3">
                    <select
                        value={parameter.type}
                        onChange={(e) => onUpdate({ type: e.target.value as ParameterType })}
                        className="w-full bg-transparent text-xs focus:outline-none"
                    >
                        <option value="STRING">String</option>
                        <option value="NUMBER">Number</option>
                        <option value="BOOLEAN">Boolean</option>
                        <option value="ENUM">Enum</option>
                        <option value="ARRAY">Array</option>
                        <option value="OBJECT">Object</option>
                    </select>
                </div>
                {/* 必填项 */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                        onClick={() => onUpdate({ isRequired: !parameter.isRequired })}
                        className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                            parameter.isRequired
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-muted text-muted-foreground border border-transparent"
                        )}
                    >
                        {parameter.isRequired ? '必填' : '可选'}
                    </button>
                    <button
                        onClick={onDelete}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-red-500 transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * EventCard - 单个事件编辑卡片
 */
const EventCard: React.FC<{
    event: TrackingEvent;
    eventIndex: number;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<TrackingEvent>) => void;
    onDelete: () => void;
    onCopy: () => void;
    onViewDiff?: () => void;
}> = ({ event, eventIndex, isExpanded, onToggle, onUpdate, onDelete, onCopy, onViewDiff }) => {
    const addParameter = () => {
        const newParam: TrackingParameter = {
            id: crypto.randomUUID(),
            name: '新参数',
            identifier: 'new_param',
            type: 'STRING',
            isRequired: false
        };
        onUpdate({ parameters: [...event.parameters, newParam] });
    };

    // 状态映射
    const statusMap = {
        'create': { label: 'NEW', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
        'edit': { label: 'EDIT', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
        'delete': { label: 'DEL', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
    };

    const operation = event.operation || 'create';
    const statusConfig = statusMap[operation];

    return (
        <div className={cn(
            "card-standard overflow-hidden border border-border/50 hover:border-border transition-all bg-surface-container-lowest",
            // 左侧状态指示条
            operation === 'create' ? "border-l-[3px] border-l-green-500" :
                operation === 'edit' ? "border-l-[3px] border-l-blue-500" :
                    "border-l-[3px] border-l-red-500"
        )}>
            {/* Header - 折叠视图(可编辑) */}
            <div className="flex items-start gap-4 p-4 hover:bg-muted/5 transition-colors group">
                {/* 展开/折叠按钮 */}
                <button
                    onClick={onToggle}
                    className="p-1 hover:bg-muted/20 rounded transition-colors text-muted-foreground mt-1 shrink-0"
                >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Status 标签 */}
                <div className="shrink-0 mt-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border tracking-tighter inline-block", statusConfig.color)}>
                        {statusConfig.label}
                    </span>
                </div>

                {/* 截图缩略图(可编辑) */}
                <div className="shrink-0">
                    <EventScreenshot
                        url={event.screenshot_url || null}
                        eventId={event.id}
                        size="small"
                        editable={true}
                        onUpload={(url) => onUpdate({ screenshot_url: url })}
                        onDelete={() => onUpdate({ screenshot_url: null })}
                    />
                </div>

                {/* Event Code (可编辑) */}
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={event.identifier}
                        onChange={(e) => onUpdate({ identifier: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent border border-transparent focus:border-primary/30 text-sm font-bold font-mono px-2 py-1 rounded transition-all hover:bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/10 text-foreground"
                        placeholder="事件标识符"
                    />
                </div>

                {/* Description (可编辑) */}
                <div className="flex-1 min-w-0">
                    <textarea
                        value={event.description || event.name}
                        onChange={(e) => onUpdate({ description: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        rows={2}
                        className="w-full bg-transparent border border-transparent focus:border-primary/30 text-sm text-foreground/80 px-2 py-1 rounded resize-none transition-all hover:bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/10"
                        placeholder="事件描述"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {event.operation === 'edit' && onViewDiff && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewDiff(); }}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all"
                            title="查看差异"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onCopy(); }}
                        className="p-1.5 rounded-lg hover:bg-muted/10 text-muted-foreground hover:text-foreground transition-all"
                        title="复制事件"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                        title="删除事件"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Expandable Content - 只显示参数列表 */}
            {isExpanded && (
                <div className="p-6 pt-0 border-t border-border/50 bg-background/50">
                    {/* Parameters Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5" />
                                埋点参数 (Parameters)
                            </h4>
                            <button
                                onClick={addParameter}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-bold hover:brightness-110 transition-all"
                            >
                                <Plus className="w-3 h-3" />
                                添加参数
                            </button>
                        </div>

                        {event.parameters.length === 0 ? (
                            <div className="p-8 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground">
                                尚无参数。点击上方按钮添加。
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {event.parameters.map((param, pIdx) => (
                                    <ParameterRow
                                        key={param.id}
                                        parameter={param}
                                        onUpdate={(upd) => {
                                            const newParams = [...event.parameters];
                                            newParams[pIdx] = { ...param, ...upd };
                                            onUpdate({ parameters: newParams });
                                        }}
                                        onDelete={() => {
                                            const newParams = event.parameters.filter((_, i) => i !== pIdx);
                                            onUpdate({ parameters: newParams });
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const EventEditor: React.FC<EventEditorProps> = ({ events, onChange }) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    const addEvent = () => {
        const newEvent: TrackingEvent = {
            id: crypto.randomUUID(),
            name: '新事件',
            identifier: 'new_event_clicked',
            operation: 'create',
            parameters: []
        };
        onChange([...events, newEvent]);
        toggleExpand(newEvent.id);
    };

    const copyEvent = (index: number) => {
        const original = events[index];
        const copied: TrackingEvent = {
            ...original,
            id: crypto.randomUUID(),
            name: `${original.name} (副本)`,
            operation: 'create', // 复制出来的事件标记为新增
        };
        onChange([...events, copied]);
        toggleExpand(copied.id);
    };

    return (
        <div className="space-y-3">
            {events.map((event, index) => (
                <EventCard
                    key={event.id}
                    event={event}
                    eventIndex={index}
                    isExpanded={expandedIds.has(event.id)}
                    onToggle={() => toggleExpand(event.id)}
                    onUpdate={(upd) => {
                        const next = [...events];
                        next[index] = { ...event, ...upd };
                        onChange(next);
                    }}
                    onDelete={() => {
                        onChange(events.filter((_, i) => i !== index));
                    }}
                    onCopy={() => copyEvent(index)}
                    onViewDiff={() => {
                        // TODO: 实现Diff视图
                        console.log('View diff for event:', event);
                    }}
                />
            ))}

            {events.length === 0 && (
                <div className="p-12 border border-dashed border-border rounded-3xl text-center bg-muted/5">
                    <p className="text-sm text-muted-foreground mb-4">开始定义您的第一个埋点事件</p>
                </div>
            )}
        </div>
    );
};
