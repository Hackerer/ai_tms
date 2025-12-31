import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkbench } from '../hooks/useWorkbench';

// Mock workflowService - 使用无延迟的同步实现
vi.mock('../services/workflowService', () => ({
    workflowService: {
        getTrackingRequest: vi.fn().mockImplementation(() => Promise.resolve(null)),
        saveDraft: vi.fn().mockImplementation(() => Promise.resolve({ success: true, savedAt: '12:00' })),
        submitForReview: vi.fn().mockImplementation(() => Promise.resolve({ success: true, newStatus: 'Reviewing' })),
        getEventHistory: vi.fn().mockImplementation(() => Promise.resolve(null)),
    }
}));

describe('useWorkbench', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('初始化状态', () => {
        it('should initialize with default request data', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            // 等待初始化完成
            await act(async () => {
                vi.runAllTimers();
            });

            expect(result.current.request.id).toBe('REQ-001');
            expect(result.current.request.status).toBe('Draft');
            expect(result.current.request.event_references.length).toBeGreaterThan(0);
        });

        it('should not be read-only for Draft status', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            expect(result.current.isReadOnly).toBe(false);
        });
    });

    describe('事件操作', () => {
        it('should toggle event expansion', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            const initialExpanded = result.current.request.event_references[0].isExpanded;

            act(() => {
                result.current.toggleExpand(0);
            });

            expect(result.current.request.event_references[0].isExpanded).toBe(!initialExpanded);
        });

        it('should create new event', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            const initialCount = result.current.request.event_references.length;

            act(() => {
                result.current.createNewEvent();
            });

            expect(result.current.request.event_references.length).toBe(initialCount + 1);
            expect(result.current.request.event_references[initialCount].operation).toBe('create');
        });

        it('should add event from asset', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            const initialCount = result.current.request.event_references.length;

            act(() => {
                result.current.addEventFromAsset({
                    id: 'EVT-NEW',
                    name: 'test_event',
                    page: '测试页面'
                });
            });

            expect(result.current.request.event_references.length).toBe(initialCount + 1);
            const newEvent = result.current.request.event_references[initialCount];
            expect(newEvent.name).toBe('test_event');
            expect(newEvent.operation).toBe('edit');
        });

        it('should copy event', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            const initialCount = result.current.request.event_references.length;

            act(() => {
                result.current.copyEvent(0);
            });

            expect(result.current.request.event_references.length).toBe(initialCount + 1);
            const copiedEvent = result.current.request.event_references[initialCount];
            expect(copiedEvent.name).toContain('_copy');
        });

        it('should delete event', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            const initialCount = result.current.request.event_references.length;

            act(() => {
                result.current.deleteEvent(0);
            });

            expect(result.current.request.event_references.length).toBe(initialCount - 1);
        });
    });

    describe('参数操作', () => {
        it('should update parameter', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            act(() => {
                result.current.updateParameter(0, 0, 'key', 'new_key');
            });

            expect(result.current.request.event_references[0].parameters[0].key).toBe('new_key');
        });

        it('should add parameter', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            const initialParamCount = result.current.request.event_references[0].parameters.length;

            act(() => {
                result.current.addParameter(0);
            });

            expect(result.current.request.event_references[0].parameters.length).toBe(initialParamCount + 1);
        });

        it('should delete parameter', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            const initialParamCount = result.current.request.event_references[0].parameters.length;

            act(() => {
                result.current.deleteParameter(0, 0);
            });

            expect(result.current.request.event_references[0].parameters.length).toBe(initialParamCount - 1);
        });
    });

    describe('冲突检测', () => {
        it('should detect no conflicts initially', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            expect(result.current.conflictInfo.hasDuplicates).toBe(false);
        });

        it('should detect duplicate event names', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            const existingName = result.current.request.event_references[0].name;

            act(() => {
                result.current.addEventFromAsset({
                    id: 'EVT-DUP',
                    name: existingName,
                    page: '测试'
                });
            });

            expect(result.current.conflictInfo.hasDuplicates).toBe(true);
            expect(result.current.conflictInfo.duplicateNames).toContain(existingName);
        });
    });

    describe('提交验证', () => {
        it('should allow submit when valid', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            expect(result.current.canSubmit).toBe(true);
        });

        it('should not allow submit with empty events', async () => {
            const { result } = renderHook(() => useWorkbench('REQ-001'));

            await act(async () => {
                vi.runAllTimers();
            });

            // 删除所有事件
            const eventCount = result.current.request.event_references.length;
            for (let i = 0; i < eventCount; i++) {
                act(() => {
                    result.current.deleteEvent(0);
                });
            }

            expect(result.current.canSubmit).toBe(false);
        });
    });
});
