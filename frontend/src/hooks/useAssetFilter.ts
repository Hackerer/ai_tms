import { useState, useMemo } from 'react';
import type { FilterState, FilterConfig } from '../types/search';

export const useAssetFilter = <T extends Record<string, any>>(
    data: T[],
    configs: FilterConfig[]
) => {
    const [searchState, setSearchState] = useState<FilterState>({
        keyword: '',
        filters: {}
    });

    const filteredData = useMemo(() => {
        return data.filter(item => {
            // 1. Keyword Search (Fuzzy)
            if (searchState.keyword) {
                const keyword = searchState.keyword.toLowerCase();
                // 默认搜索 name, id, description 字段。可根据需要扩展。
                const matchName = item.name?.toLowerCase().includes(keyword);
                const matchId = item.id?.toLowerCase().includes(keyword);
                const matchDesc = item.description?.toLowerCase().includes(keyword);

                if (!matchName && !matchId && !matchDesc) {
                    return false;
                }
            }

            // 2. Structured Filters
            for (const [key, value] of Object.entries(searchState.filters)) {
                if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                    continue;
                }

                const itemValue = item[key];
                const config = configs.find(c => c.key === key);

                if (!config) continue;

                if (config.type === 'multi-select') {
                    // 数组包含逻辑: itemValue 必须包含筛选值中的至少一个? 
                    // 通常 "状态: [Draft, Online]" 意味着 "Draft OR Online"
                    // 此时 itemValue 通常是单值 (string)。
                    if (Array.isArray(value)) {
                        if (!value.includes(itemValue)) return false;
                    }
                } else if (config.type === 'select') {
                    if (itemValue !== value) return false;
                } else if (config.type === 'boolean') {
                    if (!!itemValue !== !!value) return false;
                }
            }

            return true;
        });
    }, [data, searchState, configs]);

    const setKeyword = (keyword: string) => {
        setSearchState(prev => ({ ...prev, keyword }));
    };

    const addFilter = (key: string, value: any) => {
        setSearchState(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                [key]: value
            }
        }));
    };

    const removeFilter = (key: string) => {
        setSearchState(prev => {
            const newFilters = { ...prev.filters };
            delete newFilters[key];
            return {
                ...prev,
                filters: newFilters
            };
        });
    };

    const clearAll = () => {
        setSearchState({ keyword: '', filters: {} });
    };

    return {
        filteredData,
        searchState,
        setKeyword,
        addFilter,
        removeFilter,
        clearAll
    };
};
