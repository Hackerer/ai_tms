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
                className="w-full h-12 bg-muted/20 border-none rounded-full pl-12 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm hover:bg-muted/30"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-50">
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-full border border-border bg-background px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>
        </div>
    );
};
