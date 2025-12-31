import { ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface WorkflowStepsProps {
    currentStatus: 'Draft' | 'Reviewing' | 'Approved' | 'Rejected' | 'Applied';
}

const steps = [
    { id: 'Draft', label: '埋点需求' },
    { id: 'Reviewing', label: '埋点评审' },
    { id: 'Approved', label: '开发自测' },
    { id: 'Applied', label: '埋点验收' },
    { id: 'Online', label: '上线观察' } // Simulation: Applied is close to Online
];

export const WorkflowSteps = ({ currentStatus }: WorkflowStepsProps) => {
    // Map status to index
    const statusIdxMap: Record<string, number> = {
        'Draft': 0,
        'Reviewing': 1,
        'Approved': 2,
        'Rejected': 0, // Fallback to start
        'Applied': 3,
        'Online': 4
    };

    const currentIndex = statusIdxMap[currentStatus] || 0;

    return (
        <div className="flex items-center gap-2 text-sm">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
                                isCurrent
                                    ? "bg-primary/20 text-primary font-bold border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    : isCompleted
                                        ? "text-muted-foreground/60"
                                        : "text-muted-foreground/30"
                            )}
                        >
                            {isCompleted ? (
                                <Check className="w-3.5 h-3.5" />
                            ) : (
                                <span className={cn(
                                    "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono border",
                                    isCurrent ? "border-primary bg-primary text-white" : "border-current"
                                )}>
                                    {index + 1}
                                </span>
                            )}
                            {step.label}
                        </div>
                        {index < steps.length - 1 && (
                            <ChevronRight className={cn(
                                "w-4 h-4 mx-1",
                                index < currentIndex ? "text-primary/50" : "text-white/5"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
