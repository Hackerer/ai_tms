import React, { useEffect, useState } from 'react';
import { useTrackingTest } from '../TrackingTestContext';
import { Search, ChevronDown, Check, FileText, Calendar, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const RequestSelector: React.FC = () => {
    const { requests, fetchRequests, activeRequestId, setActiveRequestId, mode } = useTrackingTest();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && requests.length === 0) {
            setIsLoading(true);
            fetchRequests().finally(() => setIsLoading(false));
        }
    }, [isOpen, requests.length, fetchRequests]);

    const activeRequest = requests.find(r => r.id === activeRequestId);
    const filteredRequests = requests.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase())
    );

    if (mode !== 'request') return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-xl border border-border/50 transition-all text-sm min-w-[240px] justify-between group"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate text-foreground font-medium">
                        {activeRequest ? activeRequest.title : "选择关联需求单..."}
                    </span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-border/50 bg-surface-container-high/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="搜索需求 ID 或标题..."
                                className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {isLoading ? (
                            <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-[10px] font-medium">加载需求中...</span>
                            </div>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map((req) => (
                                <button
                                    key={req.id}
                                    onClick={() => {
                                        setActiveRequestId(req.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex flex-col items-start p-3 rounded-xl transition-all text-left group gap-1",
                                        activeRequestId === req.id ? "bg-primary/10" : "hover:bg-surface-container-low"
                                    )}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className={cn(
                                            "text-xs font-bold truncate",
                                            activeRequestId === req.id ? "text-primary" : "text-foreground"
                                        )}>
                                            {req.title}
                                        </span>
                                        {activeRequestId === req.id && <Check className="w-3.5 h-3.5 text-primary" />}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <span className="font-mono bg-muted/20 px-1.5 py-0.5 rounded text-[9px]">{req.id}</span>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {req.created_at}
                                        </div>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                                            req.status === 'Applied' ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {req.status}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                未找到相关需求单
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
