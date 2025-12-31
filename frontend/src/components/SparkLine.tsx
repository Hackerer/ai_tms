import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemo } from 'react';

interface SparkLineProps {
    data: number[];
    color?: string; // e.g., "var(--chart-1)" or "#3b82f6"
    height?: number;
    className?: string;
}

export const SparkLine = ({ data, color = "var(--primary)", height = 40, className }: SparkLineProps) => {
    const chartData = useMemo(() => {
        return data.map((val, i) => ({ i, value: val }));
    }, [data]);

    return (
        <div className={className} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-popover/90 border border-border text-popover-foreground text-[10px] px-2 py-1 rounded shadow-sm backdrop-blur-md font-mono">
                                        {payload[0].value}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-${color})`}
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
