import React, { useState } from 'react';
import { QrCode, Smartphone, Hash, X, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useTrackingTest } from '../TrackingTestContext';
import { cn } from '../../../lib/utils';

export const DeviceConnector: React.FC = () => {
    const { connect, startSimulation, isConnecting, isConnected, deviceId: connectedId, disconnect, isSimulating } = useTrackingTest();
    const [method, setMethod] = useState<'qrcode' | 'code'>('qrcode');
    const [deviceIdInput, setDeviceIdInput] = useState('');

    const handleConnect = () => {
        if (!deviceIdInput) return;
        connect(deviceIdInput, 'quick');
    };

    if (isConnected) {
        return (
            <div className={cn(
                "card-standard p-6 flex items-center justify-between border-primary/20",
                isSimulating ? "bg-amber-500/5" : "bg-primary/5"
            )}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center animate-pulse",
                        isSimulating ? "bg-amber-500/20 text-amber-500" : "bg-primary/20 text-primary"
                    )}>
                        {isSimulating ? <Sparkles className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground">
                                {isSimulating ? '模拟器演示中' : '设备已连接'}
                            </h3>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                isSimulating ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
                            )}>
                                {isSimulating ? 'DEMO' : 'LIVE'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">ID: {connectedId}</p>
                    </div>
                </div>
                <button
                    onClick={disconnect}
                    className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="card-standard overflow-hidden bg-surface-container-lowest">
            <div className="flex border-b border-border">
                <button
                    onClick={() => setMethod('qrcode')}
                    className={cn(
                        "flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2",
                        method === 'qrcode' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <QrCode className="w-4 h-4" />
                    扫码连接
                </button>
                <button
                    onClick={() => setMethod('code')}
                    className={cn(
                        "flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2",
                        method === 'code' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Hash className="w-4 h-4" />
                    配对码连接
                </button>
            </div>

            <div className="p-8">
                {method === 'qrcode' ? (
                    <div className="flex flex-col items-center">
                        <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-inner mb-6 relative group overflow-hidden">
                            <div className="w-full h-full bg-zinc-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                                <QrCode className="w-32 h-32 text-white opacity-20" />
                                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 p-2 gap-1 animate-pulse">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div key={i} className={cn("rounded-sm bg-white/40", Math.random() > 0.5 ? "opacity-100" : "opacity-0")} />
                                    ))}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 py-2 bg-primary text-white text-[9px] font-bold text-center translate-y-full group-hover:translate-y-0 transition-transform">
                                    点击刷新二维码
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground text-center max-w-[240px] space-y-1">
                            <p>使用 App 扫描二维码</p>
                            <p>开启 <span className="text-foreground font-bold">Debug 实时验证</span></p>
                        </div>
                        {/* 模拟入口 */}
                        <button
                            onClick={startSimulation}
                            className="mt-6 text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3" />
                            使用模拟数据开启演示模式
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">设备唯一标识 (Device ID)</label>
                            <input
                                type="text"
                                value={deviceIdInput}
                                onChange={(e) => setDeviceIdInput(e.target.value)}
                                placeholder="输入手机上的配对码..."
                                className="input-standard"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                disabled={isConnecting || !deviceIdInput}
                                onClick={handleConnect}
                                className="btn-primary flex-1"
                            >
                                {isConnecting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        开始连接
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <button
                                onClick={startSimulation}
                                className="w-12 h-10 border border-border rounded-xl flex items-center justify-center hover:bg-muted/10 transition-colors"
                                title="演示模式"
                            >
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            配对码可在 App → 开发者选项 → 埋点测试 中找到
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
