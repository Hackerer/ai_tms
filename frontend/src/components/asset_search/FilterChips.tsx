import { X } from 'lucide-react';
import type { FilterConfig, FilterState } from '../../types/search';

interface FilterChipsProps {
    filters: FilterState['filters'];
    configs: FilterConfig[];
    onRemove: (key: string) => void;
}

export const FilterChips = ({ filters, configs, onRemove }: FilterChipsProps) => {
    const activeFilters = Object.entries(filters).filter(([_, value]) =>
        value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : true)
    );

    if (activeFilters.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
            {activeFilters.map(([key, value]) => {
                const config = configs.find(c => c.key === key);
                if (!config) return null;

                const Icon = config.icon;

                // Format display value
                let displayValue = '';
                if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                } else {
                    displayValue = String(value);
                }

                // Truncate if too long
                if (displayValue.length > 20) {
                    displayValue = displayValue.slice(0, 20) + '...';
                }

                return (
                    <div
                        key={key}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-medium text-foreground border border-transparent hover:bg-surface-container-high transition-colors animate-in fade-in zoom-in duration-200"
                    >
                        {Icon && <Icon className="w-3 h-3 text-foreground-secondary" />}
                        <span className="text-foreground-secondary">{config.label}:</span>
                        <span className="font-semibold text-foreground">{displayValue}</span>
                        <button
                            onClick={() => onRemove(key)}
                            className="ml-1 rounded-full p-0.5 hover:bg-black/5 transition-colors text-foreground-secondary hover:text-foreground"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                );
            })}

            {activeFilters.length > 0 && (
                <button
                    onClick={() => activeFilters.forEach(([k]) => onRemove(k))}
                    className="text-[10px] text-muted-foreground hover:text-red-400 px-2 transition-colors"
                >
                    Clear all
                </button>
            )}
        </div>
    );
};
