import { useState, useEffect } from 'react';
import { assetService } from '../services/assetService';
import type { Parameter, Event } from '../types/asset';

export const useAssets = (pageId?: string) => {
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [p, e] = await Promise.all([
                assetService.getParameters(),
                assetService.getEvents(pageId)
            ]);
            setParameters(p);
            setEvents(e);
        } catch (error) {
            console.error('Failed to load assets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [pageId]);

    return { parameters, events, isLoading, refresh: loadData };
};
