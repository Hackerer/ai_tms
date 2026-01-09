import React from 'react';
import { ChevronRight, FileJson, BadgeCheck, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { TrackingEvent, TrackingParameter } from '../types/schema';

interface SchemaViewerProps {
    events: TrackingEvent[];
    title?: string;
    description?: string;
    mode?: 'REVIEW' | 'LOCKED' | 'READONLY';
}

/**
 * ParameterTag - 参数类型和属性标签
 */
const ParameterTag: React.FC<{ type: string; isRequired: boolean }> = ({ type, isRequired }) => (
    <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/30 border border-border/50 text-muted-foreground uppercase">
            {type}
        </span>
        {isRequired && (
            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold border border-red-500/20">
                REQUIRED
            </span>
        )}
    </div>
);

/**
 * EventRow - 只读事件行
 */
const EventRow: React.FC<{ event: TrackingEvent }> = ({ event }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div className="border border-border/40 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm hover:shadow-sm transition-all">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-muted/5 group"
            >
                <div className={cn("transition-transform duration-300", isExpanded ? "rotate-90" : "")}>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                        <span className="text-sm font-black text-foreground font-mono">{event.identifier}</span>
                        <span className="text-xs text-muted-foreground opacity-60">/</span>
                        <span className="text-xs font-bold text-muted-foreground">{event.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">
                        {event.parameters.length} Parameters
                    </span>
                    {event.triggerCondition && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                            <BadgeCheck className="w-3 h-3" />
                            <span className="text-[10px] font-bold">LOCKED</span>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="px-12 pb-6 pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="h-[1px] bg-border/20 mb-4" />
                    {event.parameters.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic pl-4">No parameters defined for this event.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {event.parameters.map((param) => (
                                <div key={param.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-border/30 hover:bg-muted/10 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold text-foreground/80">{param.identifier}</span>
                                            <span className="text-[10px] text-muted-foreground px-1 bg-muted/20 rounded">{param.name}</span>
                                        </div>
                                        {param.description && (
                                            <p className="text-[10px] text-muted-foreground/70 leading-tight">{param.description}</p>
                                        )}
                                    </div>
                                    <ParameterTag type={param.type} isRequired={param.isRequired} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ events, title, description, mode = 'READONLY' }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">{title || 'SCHEMA 资产明细'}</h3>
                    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/20 text-muted-foreground hover:text-foreground transition-all hover:bg-muted/30">
                        <FileJson className="w-4 h-4" />
                        <span className="text-[10px] font-black">EXPORT JSON</span>
                    </button>
                    {mode === 'REVIEW' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Pending Tech Review</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {events.map((event) => (
                    <EventRow key={event.id} event={event} />
                ))}
            </div>

            {events.length === 0 && (
                <div className="p-16 border border-dashed border-border/50 rounded-[40px] text-center bg-muted/5 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center">
                        <FileJson className="w-8 h-8 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-muted-foreground">Empty Schema</p>
                        <p className="text-xs text-muted-foreground/50">此方案尚未定义任何埋点事件。</p>
                    </div>
                </div>
            )}
        </div>
    );
};
