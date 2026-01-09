import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GlobalSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const GlobalSearchBar = ({ value, onChange, placeholder = "Search...", className }: GlobalSearchBarProps) => {
    return (
        <div className={cn("relative group", className)}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 bg-surface-container border-none rounded-full pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-0 focus:bg-surface-container-high transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-50">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono text-[10px] font-medium text-muted">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>
        </div>
    );
};
