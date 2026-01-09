import { ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface WorkflowStepsProps {
    currentStatus: 'DRAFT' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'APPLIED';
}

const steps = [
    { id: 'DRAFT', label: '埋点需求', shortLabel: '需求' },
    { id: 'REVIEWING', label: '埋点评审', shortLabel: '评审' },
    { id: 'APPROVED', label: '开发自测', shortLabel: '自测' },
    { id: 'APPLIED', label: '埋点验收', shortLabel: '验收' },
    { id: 'ONLINE', label: '上线观察', shortLabel: '观察' }
];

export const WorkflowSteps = ({ currentStatus }: WorkflowStepsProps) => {
    const statusIdxMap: Record<string, number> = {
        'DRAFT': 0,
        'REVIEWING': 1,
        'APPROVED': 2,
        'REJECTED': 0,
        'APPLIED': 3,
        'ONLINE': 4
    };

    const currentIndex = statusIdxMap[currentStatus] || 0;

    return (
        <div className="flex items-center gap-1 xl:gap-2 text-sm">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={step.id} className="flex items-center min-w-0">
                        <div
                            className={cn(
                                "flex items-center gap-1 xl:gap-2 px-2 xl:px-3 py-1.5 rounded-full transition-all duration-300 shrink-0",
                                isCurrent
                                    ? "bg-primary/20 text-primary font-bold border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    : isCompleted
                                        ? "text-muted-foreground/60"
                                        : "text-muted-foreground/30"
                            )}
                        >
                            {isCompleted ? (
                                <Check className="w-3 h-3 xl:w-3.5 xl:h-3.5 shrink-0" />
                            ) : (
                                <span className={cn(
                                    "w-3 h-3 xl:w-3.5 xl:h-3.5 rounded-full flex items-center justify-center text-[8px] xl:text-[9px] font-mono border shrink-0",
                                    isCurrent ? "border-primary bg-primary text-white" : "border-current"
                                )}>
                                    {index + 1}
                                </span>
                            )}
                            {/* 响应式标签：小屏隐藏，中屏缩写，大屏完整 */}
                            <span className="hidden 2xl:inline text-xs whitespace-nowrap">{step.label}</span>
                            <span className="hidden xl:inline 2xl:hidden text-xs whitespace-nowrap">{step.shortLabel}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <ChevronRight className={cn(
                                "w-3 h-3 xl:w-4 xl:h-4 mx-0.5 xl:mx-1 shrink-0",
                                index < currentIndex ? "text-primary/50" : "text-white/10"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
