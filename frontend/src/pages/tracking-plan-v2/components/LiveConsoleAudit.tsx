import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AuditEvent {
    id: string;
    name: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
    latency: string;
}

export const LiveConsoleAudit: React.FC = () => {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [isListening, setIsListening] = useState(true);

    useEffect(() => {
        if (!isListening) return;

        const interval = setInterval(() => {
            const newEvent: AuditEvent = {
                id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                name: ['cart_add_click', 'page_view_home', 'search_query', 'product_detail_view'][Math.floor(Math.random() * 4)],
                timestamp: new Date().toLocaleTimeString(),
                status: Math.random() > 0.1 ? 'success' : 'warning',
                latency: (Math.random() * 200 + 50).toFixed(0) + 'ms'
            };

            setEvents(prev => [newEvent, ...prev].slice(0, 5));
        }, 3000);

        return () => clearInterval(interval);
    }, [isListening]);

    return (
        <div className="card-standard p-8 bg-surface-container-lowest h-full border-border/40 flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Terminal className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-foreground tracking-widest uppercase">Live Audit Console</h3>
                </div>
                <button
                    onClick={() => setIsListening(!isListening)}
                    className="flex items-center gap-2"
                >
                    <div className={cn("w-2 h-2 rounded-full", isListening ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-muted")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-tighter", isListening ? "text-green-500" : "text-muted-foreground")}>
                        {isListening ? 'Listening' : 'Paused'}
                    </span>
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 bg-muted/5 rounded-[24px] border border-dashed border-border/50 animate-pulse">
                        <Clock className="w-8 h-8 text-muted/20" />
                        <p className="text-[11px] text-muted-foreground font-black italic">Awaiting pulse signal...</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in duration-500">
                        {events.map((evt, idx) => (
                            <div
                                key={evt.id}
                                className={cn(
                                    "p-3 rounded-2xl border transition-all duration-500 flex items-center justify-between group cursor-pointer hover:scale-[1.02]",
                                    idx === 0 ? "bg-primary/5 border-primary/20 scale-100 opacity-100" : "bg-muted/5 border-border/40 scale-95 opacity-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {evt.status === 'success' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black tracking-tight text-foreground">{evt.name}</span>
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase">{evt.id} • {evt.timestamp}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">{evt.latency}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Overlay Gradient for Fade-out */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-container-lowest to-transparent pointer-events-none" />
            </div>
        </div>
    );
};
