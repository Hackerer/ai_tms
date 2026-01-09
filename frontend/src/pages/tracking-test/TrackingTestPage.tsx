import React, { useState } from 'react';
import { TrackingTestProvider, useTrackingTest } from './TrackingTestContext';
import type { ValidationEvent } from './types';
import { DeviceConnector } from './components/DeviceConnector';
import { ValidationStats } from './components/ValidationStats';
import { EventStream } from './components/EventStream';
import { EventDetail } from './components/EventDetail';
import { RequestSelector } from './components/RequestSelector';
import { FileDown, ArrowLeft, Settings2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const TrackingTestDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { isConnected, mode, setMode, events, clearEvents, exportReport } = useTrackingTest();
    const [selectedEvent, setSelectedEvent] = useState<ValidationEvent | null>(null);

    return (
        <div className="flex flex-col h-full bg-surface-dim">
            {/* Header */}
            <header className="shrink-0 px-8 py-6 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between z-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-muted/20 rounded-xl text-muted-foreground hover:text-foreground transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-foreground tracking-tight">埋点实时测试</h1>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-black border",
                                isConnected ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground border-border"
                            )}>
                                {isConnected ? 'LIVE' : '离线'}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            实时采集 App/Web 上报流量，并在实验室中进行元数据核对
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-muted/10 rounded-full p-1 border border-border flex items-center gap-1">
                        <button
                            onClick={() => setMode('quick')}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                                mode === 'quick' ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            快速测试
                        </button>
                        <button
                            onClick={() => setMode('metadata')}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                                mode === 'metadata' ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            元数据验证
                        </button>
                        <button
                            onClick={() => setMode('request')}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                                mode === 'request' ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            需求验证
                        </button>
                    </div>

                    <RequestSelector />

                    <button
                        onClick={exportReport}
                        disabled={events.length === 0}
                        className="btn-primary h-10 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <FileDown className="w-4 h-4" />
                        导出报告
                    </button>

                    <button
                        onClick={clearEvents}
                        disabled={events.length === 0}
                        className="p-2 hover:bg-muted/20 rounded-xl text-muted-foreground hover:text-destructive transition-all disabled:opacity-30"
                        title="清空记录"
                    >
                        <Settings2 className="w-5 h-5 rotate-90" /> {/* 临时用这个图标代替 Trash，或者直接导入 Trash2 */}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 min-h-0 overflow-hidden flex flex-col p-8 gap-8">
                {/* Top Row: Connector and Global Stats */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 shrink-0">
                    <div className="xl:col-span-1">
                        <DeviceConnector />
                    </div>
                    <div className="xl:col-span-2">
                        <ValidationStats />
                    </div>
                </div>

                {/* Bottom Row: Stream and Detail */}
                <div className="flex-1 min-h-0 flex gap-8">
                    {/* Left: Event Stream */}
                    <div className="w-[45%] flex flex-col min-h-0">
                        <EventStream
                            onSelectEvent={setSelectedEvent}
                            selectedEventId={selectedEvent?.id}
                        />
                    </div>

                    {/* Right: Detail Overlay/Drawer */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <EventDetail
                            event={selectedEvent}
                            onClose={() => setSelectedEvent(null)}
                        />
                    </div>
                </div>
            </main>

            {/* Hint Bar */}
            <footer className="px-8 py-3 bg-primary text-primary-foreground flex items-center justify-between text-[11px] font-bold tracking-wide">
                <div className="flex items-center gap-4">
                    <span className="opacity-80">当前模式: {mode === 'quick' ? '快速测试' : mode === 'metadata' ? '元数据验证' : '需求验证'}</span>
                    <span className="w-1 h-1 rounded-full bg-white opacity-40" />
                    <span className="opacity-80">WebSocket: {isConnected ? '已建立长连接' : '等待建立连接...'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Settings2 className="w-3 h-3" />
                    验证配置
                </div>
            </footer>
        </div>
    );
};

export const TrackingTestPage: React.FC = () => {
    return (
        <TrackingTestProvider>
            <TrackingTestDashboard />
        </TrackingTestProvider>
    );
};

export default TrackingTestPage;
