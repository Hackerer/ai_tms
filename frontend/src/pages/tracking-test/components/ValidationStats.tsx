import React from 'react';
import { useTrackingTest } from '../TrackingTestContext';
import { CheckCircle2, XCircle, AlertCircle, Activity } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const ValidationStats: React.FC = () => {
    const { stats } = useTrackingTest();

    const items = [
        { label: '总上报', value: stats.total, color: 'text-foreground', icon: Activity, bg: 'bg-foreground/5' },
        { label: '校验成功', value: stats.success, color: 'text-green-500', icon: CheckCircle2, bg: 'bg-green-500/10' },
        { label: '校验失败', value: stats.failed, color: 'text-destructive', icon: XCircle, bg: 'bg-destructive/10' },
        { label: '数据告警', value: stats.warning, color: 'text-orange-500', icon: AlertCircle, bg: 'bg-orange-500/10' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
                <div key={i} className="card-standard p-4 bg-surface-container-lowest flex flex-col items-center text-center">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-2", item.bg, item.color)}>
                        <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                    <span className={cn("text-2xl font-black mt-1 tabular-nums", item.color)}>{item.value}</span>
                </div>
            ))}
        </div>
    );
};
