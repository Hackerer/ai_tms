import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ValidationEvent, ValidationStats, TestMode, TrackingRequest } from './types';
import { MOCK_EVENTS } from './mockData';

interface TrackingTestContextType {
    isConnected: boolean;
    isConnecting: boolean;
    deviceId: string;
    events: ValidationEvent[];
    stats: ValidationStats;
    mode: TestMode;
    activeRequestId?: string;
    isSimulating: boolean;
    requests: TrackingRequest[];

    // Actions
    connect: (deviceId: string, mode: TestMode, requestId?: string) => void;
    startSimulation: () => void;
    disconnect: () => void;
    clearEvents: () => void;
    setMode: (mode: TestMode) => void;
    setActiveRequestId: (id: string) => void;
    fetchRequests: () => Promise<void>;
    exportReport: () => Promise<void>;
}

const TrackingTestContext = createContext<TrackingTestContextType | undefined>(undefined);

export const TrackingTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [deviceId, setDeviceId] = useState('');
    const [events, setEvents] = useState<ValidationEvent[]>([]);
    const [mode, setMode] = useState<TestMode>('quick');
    const [activeRequestId, setActiveRequestId] = useState<string>();
    const [requests, setRequests] = useState<TrackingRequest[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const simulationTimerRef = useRef<any>(null);

    const stats: ValidationStats = events.reduce((acc, curr) => {
        acc.total++;
        if (curr.status === 'success') acc.success++;
        else if (curr.status === 'failed') acc.failed++;
        else if (curr.status === 'warning') acc.warning++;
        return acc;
    }, { total: 0, success: 0, failed: 0, warning: 0 });

    const fetchRequests = useCallback(async () => {
        try {
            const response = await fetch('/api/tracking/requests?all=true');
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            // 这里不再需要 mock 数据，API 已上线
            setRequests([]);
        }
    }, []);

    const exportReport = useCallback(async () => {
        if (events.length === 0) return;
        try {
            const response = await fetch('/api/tracking/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events, format: 'csv' })
            });
            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tracking_test_report_${new Date().getTime()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            alert('报告导出失败，请检查 API 服务器状态');
        }
    }, [events]);

    const stopSimulation = () => {
        if (simulationTimerRef.current) {
            clearInterval(simulationTimerRef.current);
            simulationTimerRef.current = null;
        }
        setIsSimulating(false);
    };

    const startSimulation = useCallback(() => {
        if (isConnected) return;

        setIsConnecting(true);
        setDeviceId('SIMULATOR-001');

        setTimeout(() => {
            setIsConnected(true);
            setIsConnecting(false);
            setIsSimulating(true);
            setEvents([]);

            let index = 0;
            simulationTimerRef.current = setInterval(() => {
                const baseEvent = MOCK_EVENTS[index % MOCK_EVENTS.length];
                const newEvent: ValidationEvent = {
                    id: Math.random().toString(36).substr(2, 9),
                    eventName: baseEvent.eventName!,
                    properties: baseEvent.properties!,
                    status: baseEvent.status as any,
                    errors: baseEvent.errors!,
                    expectedProps: baseEvent.expectedProps,
                    timestamp: new Date().toLocaleTimeString(),
                    metadata_id: `EVT-MOCK-${Math.floor(Math.random() * 1000)}`
                };

                setEvents(prev => [newEvent, ...prev]);
                index++;
            }, 2000);
        }, 1000);
    }, [isConnected]);

    const connect = useCallback((id: string, startMode: TestMode, reqId?: string) => {
        stopSimulation();
        if (wsRef.current) wsRef.current.close();

        setIsConnecting(true);
        setDeviceId(id);

        const ws = new WebSocket('ws://localhost:8765');
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setIsConnecting(false);
            ws.send(JSON.stringify({
                action: 'start_validation',
                payload: {
                    deviceId: id,
                    mode: startMode,
                    requestId: reqId || activeRequestId
                }
            }));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'validation_result') {
                const newEvent: ValidationEvent = {
                    id: Math.random().toString(36).substr(2, 9),
                    eventName: message.data.eventName,
                    properties: message.data.properties,
                    status: message.data.status,
                    errors: message.data.errors,
                    expectedProps: message.data.expectedProps,
                    timestamp: new Date().toLocaleTimeString(),
                    metadata_id: message.data.event_id
                };
                setEvents(prev => [newEvent, ...prev]);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            setIsConnecting(false);
        };

        ws.onerror = () => {
            setIsConnecting(false);
        };
    }, [activeRequestId]);

    const disconnect = useCallback(() => {
        stopSimulation();
        wsRef.current?.close();
        setIsConnected(false);
    }, []);

    const clearEvents = useCallback(() => {
        setEvents([]);
    }, []);

    return (
        <TrackingTestContext.Provider value={{
            isConnected,
            isConnecting,
            deviceId,
            events,
            stats,
            mode,
            activeRequestId,
            isSimulating,
            requests,
            connect,
            startSimulation,
            disconnect,
            clearEvents,
            setMode,
            setActiveRequestId,
            fetchRequests,
            exportReport
        }}>
            {children}
        </TrackingTestContext.Provider>
    );
};

export const useTrackingTest = () => {
    const context = useContext(TrackingTestContext);
    if (!context) throw new Error('useTrackingTest must be used within TrackingTestProvider');
    return context;
};
