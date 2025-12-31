import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface FeatureIconProps {
    icon: LucideIcon;
    className?: string;
    variant?: 'primary' | 'success' | 'warning' | 'purple' | 'pink';
    scale?: number;
}

const variants = {
    primary: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
    success: "bg-green-500/10 text-green-500 ring-green-500/20",
    warning: "bg-orange-500/10 text-orange-500 ring-orange-500/20",
    purple: "bg-purple-500/10 text-purple-500 ring-purple-500/20",
    pink: "bg-pink-500/10 text-pink-500 ring-pink-500/20",
};

export const FeatureIcon = ({
    icon: Icon,
    className,
    variant = 'primary',
    scale = 1
}: FeatureIconProps) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center ring-1 inset ring-inset backdrop-blur-sm transition-colors",
                variants[variant],
                className
            )}
        >
            <Icon
                className="w-5 h-5"
                strokeWidth={2}
                style={{ transform: `scale(${scale})` }}
            />
        </motion.div>
    );
};
