export type FilterValue = string | string[] | number | boolean;

export interface FilterState {
    keyword: string;
    filters: Record<string, FilterValue>;
}

export type FilterOption = {
    label: string;
    value: string | number | boolean;
    color?: string; // Optional color for badge/pill
};

export type FilterType = 'select' | 'multi-select' | 'boolean';

export interface FilterConfig {
    key: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    type: FilterType;
    options?: FilterOption[];
}
