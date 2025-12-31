import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { FilterConfig, FilterValue } from '../../types/search';
import { cn } from '../../lib/utils';

interface FilterBuilderProps {
    configs: FilterConfig[];
    activeFilters: Record<string, FilterValue>;
    onAddFilter: (key: string, value: any) => void;
}

export const FilterBuilder = ({ configs, activeFilters, onAddFilter }: FilterBuilderProps) => {
    return (
        <div className="flex items-center gap-2">
            {configs.map(config => (
                <FilterDropdown
                    key={config.key}
                    config={config}
                    currentValue={activeFilters[config.key]}
                    onSelect={(val) => onAddFilter(config.key, val)}
                />
            ))}
        </div>
    );
};

// Internal Component for individual Dropdown
const FilterDropdown = ({
    config,
    currentValue,
    onSelect
}: {
    config: FilterConfig,
    currentValue: FilterValue,
    onSelect: (val: any) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleOptionSelect = (optionValue: string | number | boolean) => {
        if (config.type === 'multi-select') {
            const list = Array.isArray(currentValue) ? [...currentValue] : [];
            const index = list.indexOf(optionValue as never);
            if (index > -1) {
                list.splice(index, 1);
            } else {
                list.push(optionValue as never);
            }
            onSelect(list);
        } else {
            // Single select toggle
            if (currentValue === optionValue) {
                onSelect(undefined); // Clear
            } else {
                onSelect(optionValue);
            }
            setIsOpen(false);
        }
    };

    const isActive = Array.isArray(currentValue) ? currentValue.length > 0 : !!currentValue;

    // Calculate display label or count
    let labelSuffix = '';
    if (Array.isArray(currentValue) && currentValue.length > 0) {
        labelSuffix = ` (${currentValue.length})`;
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    isActive || isOpen
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                )}
            >
                {config.icon && <config.icon className="w-3.5 h-3.5 opacity-70" />}
                <span>{config.label}{labelSuffix}</span>
                <ChevronDown className={cn("w-3 h-3 opacity-50 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[160px]">
                    <div className="p-1">
                        {config.options?.map(option => {
                            const isSelected = config.type === 'multi-select'
                                ? (currentValue as any[])?.includes(option.value)
                                : currentValue === option.value;

                            return (
                                <button
                                    key={String(option.value)}
                                    onClick={() => handleOptionSelect(option.value)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-xs transition-colors text-left",
                                        isSelected ? "bg-primary/5" : ""
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {option.color && <div className={cn("w-2 h-2 rounded-full", option.color)} />}
                                        <span className={cn(isSelected ? "text-primary font-bold" : "text-white/80")}>
                                            {option.label}
                                        </span>
                                    </div>
                                    {isSelected && <Check className="w-3 h-3 text-primary" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
