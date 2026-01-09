import React, { useState } from 'react';
import type { ValidationEvent } from '../types';
import {
    X, CheckCircle2, XCircle, AlertCircle, Terminal,
    Info, Copy, ExternalLink, Sparkles, Wand2, FileCode2, LayoutDashboard
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface EventDetailProps {
    event: ValidationEvent | null;
    onClose: () => void;
}

/**
 * 极简 Levenshtein 距离算法
 */
const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

/**
 * 查找最相似的建议
 */
const findSuggestion = (actual: string, expectedList: string[]): string | null => {
    if (!expectedList || expectedList.length === 0) return null;
    let minDistance = Math.floor(actual.length / 2) + 1;
    let bestMatch = null;

    for (const expected of expectedList) {
        const distance = getLevenshteinDistance(actual.toLowerCase(), expected.toLowerCase());
        if (distance <= minDistance) {
            minDistance = distance;
            bestMatch = expected;
        }
    }
    return bestMatch;
};

export const EventDetail: React.FC<EventDetailProps> = ({ event, onClose }) => {
    const [activeTab, setActiveTab] = useState<'validation' | 'json'>('validation');

    if (!event) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-surface-container/30 rounded-2xl border border-dashed border-border/50">
                <Terminal className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-sm">选中左侧埋点查看详情</p>
            </div>
        );
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // 这里可以加一个简单的 Toast 通知
    };

    return (
        <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border bg-surface-container-low flex items-center justify-between shrink-0">
                <div className="min-w-0">
                    <h3 className="font-black text-lg text-foreground font-mono truncate">{event.eventName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        ID: <span className="font-mono text-primary font-bold">{event.metadata_id || 'DEMO-TRACE-001'}</span>
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted/20 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs Selector */}
            <div className="px-6 py-3 bg-surface-container-low border-b border-border flex items-center gap-4 shrink-0">
                <button
                    onClick={() => setActiveTab('validation')}
                    className={cn(
                        "flex items-center gap-2 text-xs font-black transition-all pb-1.5 border-b-2",
                        activeTab === 'validation' ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                    )}
                >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    验证报告
                </button>
                <button
                    onClick={() => setActiveTab('json')}
                    className={cn(
                        "flex items-center gap-2 text-xs font-black transition-all pb-1.5 border-b-2",
                        activeTab === 'json' ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                    )}
                >
                    <FileCode2 className="w-3.5 h-3.5" />
                    原始日志 (JSON)
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {activeTab === 'validation' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                        {/* 1. 校验结果面板 */}
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                                质量分析报告
                                {event.status === 'success' && <Sparkles className="w-3 h-3 text-amber-500" />}
                            </h4>
                            {event.errors.length > 0 ? (
                                <div className="space-y-2">
                                    {event.errors.map((error, i) => (
                                        <div key={i} className={cn(
                                            "p-4 rounded-xl border flex items-start gap-3",
                                            error.severity === 'error' ? "bg-destructive/5 border-destructive/20" : "bg-orange-500/5 border-orange-500/20"
                                        )}>
                                            {error.severity === 'error' ? (
                                                <XCircle className="w-5 h-5 text-destructive shrink-0" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-xs font-black uppercase tracking-tighter", error.severity === 'error' ? "text-destructive" : "text-orange-600")}>
                                                    {error.type}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{error.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-black text-green-700 font-black">全量校验通过 / PARITY OK</span>
                                </div>
                            )}
                        </section>

                        {/* 2. 上报属性详情 */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between pl-1">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">抓包属性 (Field Analysis)</h4>
                                <button
                                    onClick={() => copyToClipboard(JSON.stringify(event.properties, null, 2))}
                                    className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 group"
                                >
                                    <Copy className="w-3 h-3 group-hover:scale-110 transition-transform" /> 复制上下文
                                </button>
                            </div>

                            <div className="bg-surface-container rounded-2xl border border-border/50 overflow-hidden font-mono text-xs">
                                <div className="grid grid-cols-[1fr,1.5fr] border-b border-border/50 bg-black/5">
                                    <div className="px-5 py-3 text-muted-foreground font-black border-r border-border/50 uppercase tracking-tight">参数 (Key)</div>
                                    <div className="px-5 py-3 text-muted-foreground font-black uppercase tracking-tight">数值 (Value)</div>
                                </div>
                                <div className="divide-y divide-border/50">
                                    {Object.entries(event.properties).map(([key, val]) => {
                                        const isUndefined = !event.expectedProps?.includes(key);
                                        const suggestion = isUndefined ? findSuggestion(key, event.expectedProps || []) : null;

                                        return (
                                            <div key={key} className={cn(
                                                "grid grid-cols-[1fr,1.5fr] group transition-all",
                                                isUndefined ? "bg-orange-500/[0.03]" : "hover:bg-foreground/5"
                                            )}>
                                                <div className="px-5 py-4 border-r border-border/50 flex flex-col gap-1.5 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "font-bold truncate",
                                                            isUndefined ? "text-orange-600" : "text-foreground-secondary"
                                                        )} title={key}>
                                                            {key}
                                                        </span>
                                                        {isUndefined && <AlertCircle className="w-3 h-3 text-orange-500 shrink-0" />}
                                                    </div>
                                                    {suggestion && (
                                                        <div className="flex items-center gap-1.5 p-1.5 bg-primary/10 rounded-lg animate-in slide-in-from-left-2 duration-300">
                                                            <Wand2 className="w-3 h-3 text-primary shrink-0" />
                                                            <span className="text-[9px] font-black text-primary truncate">
                                                                纠正为: <span className="underline decoration-dotted">{suggestion}</span> ?
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-5 py-4 flex items-center justify-between group">
                                                    <span className={cn(
                                                        "truncate font-bold",
                                                        typeof val === 'number' ? "text-blue-500" :
                                                            typeof val === 'boolean' ? "text-purple-500" :
                                                                "text-green-600"
                                                    )}>
                                                        {JSON.stringify(val)}
                                                    </span>
                                                    <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary/10 rounded-lg transition-all">
                                                        <Info className="w-3.5 h-3.5 text-primary" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* 3. 后续操作 */}
                        {event.metadata_id && (
                            <section className="pt-4 border-t border-border">
                                <button className="flex items-center gap-2 text-xs font-black text-primary hover:underline group">
                                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    前往元数据库审查该定义
                                </button>
                            </section>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center justify-between pl-1 shrink-0">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">原始数据结构</h4>
                            <button
                                onClick={() => copyToClipboard(JSON.stringify(event, null, 2))}
                                className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 group"
                            >
                                <Copy className="w-3 h-3" /> 复制 JSON
                            </button>
                        </div>
                        <div className="flex-1 bg-surface-container rounded-2xl border border-border/50 p-6 font-mono text-xs overflow-auto leading-relaxed text-foreground-secondary selection:bg-primary/20">
                            <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(event, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
