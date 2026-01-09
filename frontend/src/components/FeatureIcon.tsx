import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface FeatureIconProps {
    icon: LucideIcon;
    className?: string;
    variant?: 'primary' | 'success' | 'warning' | 'purple' | 'pink';
    scale?: number;
}

const variants = {
    primary: "bg-blue-500/10 text-blue-600",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-orange-500/10 text-orange-600",
    purple: "bg-purple-500/10 text-purple-600",
    pink: "bg-pink-500/10 text-pink-600",
};

export const FeatureIcon = ({
    icon: Icon,
    className,
    variant = 'primary',
    scale = 1
}: FeatureIconProps) => {
    return (
        <div
            className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-none",
                variants[variant],
                className
            )}
        >
            <Icon
                className="w-5 h-5"
                strokeWidth={2}
                style={{ transform: `scale(${scale})` }}
            />
        </div>
    );
};
