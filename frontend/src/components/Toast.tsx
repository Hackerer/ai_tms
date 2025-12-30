import { Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';

export const Toast = () => {
    const { toast } = useUI();

    if (!toast) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-md shadow-2xl",
                toast.type === 'success' ? "bg-green-500/20 border-green-500/20 text-green-400" :
                    toast.type === 'error' ? "bg-red-500/20 border-red-500/20 text-red-400" :
                        "bg-blue-500/20 border-blue-500/20 text-blue-400"
            )}>
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                {toast.type === 'info' && <Info className="w-5 h-5" />}
                <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
            </div>
        </div>
    );
};
