import React, { useState, useMemo } from 'react';
import { useTrackingTest } from '../TrackingTestContext';
import type { ValidationEvent } from '../types';
import { EventFilter, type FilterState } from './EventFilter';
import { cn } from '../../../lib/utils';
import {
    CheckCircle2, XCircle, AlertCircle, ChevronRight,
    Clock, Box, TrendingUp, SearchCode
} from 'lucide-react';

interface EventStreamProps {
    onSelectEvent: (event: ValidationEvent) => void;
    selectedEventId?: string;
}

export const EventStream: React.FC<EventStreamProps> = ({ onSelectEvent, selectedEventId }) => {
    const { events, clearEvents } = useTrackingTest();
    const [filters, setFilters] = useState<FilterState>({
        query: '',
        selectedNames: [],
        selectedTypes: [],
        isExcludeMode: false
    });

    // 提取所有出现的事件名用于筛选器
    const availableEventNames = useMemo(() => {
        const names = new Set<string>();
        events.forEach(e => names.add(e.eventName));
        return Array.from(names).sort();
    }, [events]);

    // 核心过滤逻辑：支持正选、反选、多选与搜索
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            // 1. 关键词搜索
            if (filters.query && !event.eventName.toLowerCase().includes(filters.query.toLowerCase())) {
                return false;
            }

            // 2. 名称筛选逻辑
            if (filters.selectedNames.length > 0) {
                const isMatched = filters.selectedNames.includes(event.eventName);
                // 如果是反选模式，命中则隐藏（返回 false）；如果是正选模式，命中则显示（返回 true）
                if (filters.isExcludeMode) {
                    if (isMatched) return false;
                } else {
                    if (!isMatched) return false;
                }
            }

            // 未来可扩展事件类型筛选...

            return true;
        });
    }, [events, filters]);

    if (events.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-2xl bg-muted/5">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                    <Box className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-medium">等待埋点上报...</p>
                <p className="text-xs mt-1">在测试设备上触发行为，实时抓包将出现在这里</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-surface-container-lowest rounded-2xl border border-border overflow-hidden">
            {/* Header with Integrated Filter */}
            <div className="px-5 py-4 border-b border-border bg-surface-container-low flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black uppercase tracking-tight">实时行为流</h3>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">LIVE</span>
                        <div className="h-4 w-[1px] bg-border mx-1" />
                        <span className="text-[10px] text-muted-foreground font-bold">
                            已展示 {filteredEvents.length} / {events.length}
                        </span>
                    </div>
                </div>

                <EventFilter
                    availableEventNames={availableEventNames}
                    availableEventTypes={[]} // 待后端上送元数据后扩展
                    onFilterChange={setFilters}
                />
            </div>

            <div className="flex-1 overflow-auto bg-surface-container-lowest custom-scrollbar">
                {filteredEvents.length > 0 ? (
                    <div className="flex flex-col">
                        {filteredEvents.map((event: ValidationEvent, index: number) => {
                            const sequenceNum = events.length - events.findIndex(e => e.id === event.id);

                            return (
                                <React.Fragment key={event.id}>
                                    <div
                                        onClick={() => onSelectEvent(event)}
                                        className={cn(
                                            "group relative px-5 py-4 flex items-center gap-4 cursor-pointer transition-all animate-in slide-in-from-top-4 duration-300",
                                            selectedEventId === event.id ? "bg-primary/5 active-scale-98" : "hover:bg-muted/5"
                                        )}
                                    >
                                        {/* 时序连接线 - 仅在未过滤或连续展示时体现 */}
                                        {index < filteredEvents.length - 1 && (
                                            <div className="absolute left-[31px] top-[44px] w-0.5 h-[calc(100%+8px)] bg-border/20 -z-0" />
                                        )}

                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border z-10 transition-transform group-hover:scale-105",
                                            event.status === 'success' ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]" :
                                                event.status === 'failed' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                    "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                        )}>
                                            {event.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                                event.status === 'failed' ? <XCircle className="w-5 h-5" /> :
                                                    <AlertCircle className="w-5 h-5" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-foreground truncate font-mono tracking-tight">
                                                    {event.eventName}
                                                </span>
                                                {event.errors.length > 0 && (
                                                    <span className="px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground text-[8px] font-black uppercase">
                                                        {event.errors.filter(e => e.severity === 'error').length} ERR
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                                                    <Clock className="w-3 h-3" />
                                                    {event.timestamp}
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3 opacity-50" />
                                                    SEQ: #{sequenceNum}
                                                </div>
                                            </div>
                                        </div>

                                        <ChevronRight className={cn(
                                            "w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all",
                                            selectedEventId === event.id ? "translate-x-1 text-primary" : ""
                                        )} />
                                    </div>

                                    {/* 间隙指示器 - 在过滤模式下隐藏或调整 */}
                                    {index < filteredEvents.length - 1 && !filters.selectedNames.length && (
                                        <div className="px-5 py-1 pl-[50px]">
                                            <div className="text-[9px] font-black text-muted-foreground/10 uppercase tracking-widest flex items-center gap-2">
                                                <div className="h-[1px] w-4 bg-border/10" />
                                                Interval: Δt
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 p-12">
                        <SearchCode className="w-12 h-12 opacity-10 mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">未命中过滤条目</p>
                        <button
                            onClick={() => setFilters({ query: '', selectedNames: [], selectedTypes: [], isExcludeMode: false })}
                            className="mt-4 text-[10px] font-black text-primary hover:underline"
                        >
                            重置筛选条件
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
