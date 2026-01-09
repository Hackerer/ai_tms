import { useState, useMemo, useCallback, useEffect } from 'react';
import type { TrackingRequest, EventChange, WorkflowParameter as Parameter } from '../types/workflow';
import { workflowService } from '../services/workflowService';

/**
 * 工作台核心 Hook
 * 管理埋点需求单的状态和所有业务操作
 */
export const useWorkbench = (requestId: string) => {
    // ========================
    // 状态管理
    // ========================

    const [request, setRequest] = useState<TrackingRequest>({
        id: requestId || 'REQ-001',
        title: '2025Q1 支付环节漏斗治理',
        status: 'DRAFT',
        created_user_id: 'USER-001',
        doc_url: '',
        event_references: [
            {
                id: 'EVT-001',
                name: 'cart_add_click',
                operation: 'edit',
                description: '购物车添加按钮点击，需增加优惠券核销字段',
                isExpanded: true,
                screenshot_url: '/screenshots/mock_event_screenshot_2_1767337029453.png',
                parameters: [
                    { key: 'item_id', type: 'String', desc: '商品唯一ID', isRequired: true },
                    { key: 'coupon_code', type: 'String', desc: '核销券码', isRequired: false },
                    { key: 'price', type: 'Number', desc: '券后价格', isRequired: true }
                ]
            },
            {
                id: 'EVT-NEW-001',
                name: 'banner_recommend_show',
                operation: 'create',
                description: '首页智能瀑布流曝光统计',
                isExpanded: false,
                screenshot_url: '/screenshots/mock_event_screenshot_1_1767337009085.png',
                parameters: [
                    { key: 'pos_id', type: 'Number', desc: '展示坑位', isRequired: true },
                    { key: 'rec_id', type: 'String', desc: '算法推荐引擎ID', isRequired: true }
                ]
            }
        ]
    });

    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ========================
    // 数据加载
    // ========================

    /** 从服务端加载需求单数据 */
    useEffect(() => {
        if (!requestId) return;

        const loadRequest = async () => {
            setIsLoading(true);
            try {
                const data = await workflowService.getTrackingRequest(requestId);
                if (data) {
                    setRequest(data);
                }
            } catch (error) {
                console.error('[useWorkbench] Failed to load request:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadRequest();
    }, [requestId]);

    // ========================
    // 计算属性
    // ========================

    /** 是否为只读模式 */
    const isReadOnly = useMemo(() => {
        return request.status !== 'DRAFT' && request.status !== 'REJECTED';
    }, [request.status]);

    /** 冲突检测：检查是否有重复事件名 */
    const conflictInfo = useMemo(() => {
        const eventNames = request.event_references.map(r => r.name);
        const duplicates = eventNames.filter((name, index) => eventNames.indexOf(name) !== index);
        return {
            hasDuplicates: duplicates.length > 0,
            duplicateNames: duplicates
        };
    }, [request.event_references]);

    // ========================
    // 事件操作
    // ========================

    /** 展开/折叠事件 */
    const toggleExpand = useCallback((index: number) => {
        setRequest(prev => {
            const newRefs = [...prev.event_references];
            newRefs[index] = { ...newRefs[index], isExpanded: !newRefs[index].isExpanded };
            return { ...prev, event_references: newRefs };
        });
    }, []);

    /** 从资产库添加事件（标记为 EDIT） */
    const addEventFromAsset = useCallback((asset: { id: string; name: string; page?: string }) => {
        const newChange: EventChange = {
            id: asset.id,
            name: asset.name,
            operation: 'edit',
            description: `从资产库拉取: ${asset.page || '未知页面'}`,
            isExpanded: false,
            parameters: []
        };
        setRequest(prev => ({
            ...prev,
            event_references: [...prev.event_references, newChange]
        }));
        return newChange;
    }, []);

    /** 直接新建事件（标记为 CREATE） */
    const createNewEvent = useCallback(() => {
        const newEvent: EventChange = {
            id: `EVT-NEW-${Date.now()}`,
            name: 'new_event_name',
            operation: 'create',
            description: '新建事件描述',
            isExpanded: true,
            parameters: [
                { key: 'param_1', type: 'String', desc: '参数描述', isRequired: true }
            ]
        };
        setRequest(prev => ({
            ...prev,
            event_references: [...prev.event_references, newEvent]
        }));
        return newEvent;
    }, []);

    /** 复制事件 */
    const copyEvent = useCallback((index: number) => {
        const eventToCopy = request.event_references[index];
        const copiedEvent: EventChange = {
            ...eventToCopy,
            id: `${eventToCopy.id}-COPY-${Date.now()}`,
            name: `${eventToCopy.name}_copy`,
            isExpanded: false,
            parameters: eventToCopy.parameters.map(p => ({ ...p }))
        };
        setRequest(prev => ({
            ...prev,
            event_references: [...prev.event_references, copiedEvent]
        }));
        return copiedEvent;
    }, [request.event_references]);

    /** 删除事件 */
    const deleteEvent = useCallback((index: number) => {
        const eventToDelete = request.event_references[index];
        setRequest(prev => ({
            ...prev,
            event_references: prev.event_references.filter((_, i) => i !== index)
        }));
        return eventToDelete;
    }, [request.event_references]);

    /** 更新事件字段 */
    const updateEventField = useCallback((index: number, field: keyof EventChange, value: any) => {
        setRequest(prev => {
            const newRefs = [...prev.event_references];
            newRefs[index] = { ...newRefs[index], [field]: value };
            return { ...prev, event_references: newRefs };
        });
    }, []);

    /** 批量删除事件 */
    const deleteEventsByIds = useCallback((ids: string[]) => {
        setRequest(prev => ({
            ...prev,
            event_references: prev.event_references.filter(e => !ids.includes(e.id))
        }));
    }, []);

    /** 批量添加参数 */
    const addParameterToEvents = useCallback((eventIds: string[], param: Parameter) => {
        setRequest(prev => {
            const newRefs = prev.event_references.map(evt => {
                if (eventIds.includes(evt.id)) {
                    // Check if param key exists to avoid duplicates
                    if (evt.parameters.some(p => p.key === param.key)) {
                        return evt;
                    }
                    return {
                        ...evt,
                        parameters: [...evt.parameters, param]
                    };
                }
                return evt;
            });
            return { ...prev, event_references: newRefs };
        });
    }, []);

    // ========================
    // 参数操作
    // ========================

    /** 修改参数 */
    const updateParameter = useCallback((eventIdx: number, paramIdx: number, field: keyof Parameter, value: any) => {
        setRequest(prev => {
            const newRefs = [...prev.event_references];
            const newParams = [...newRefs[eventIdx].parameters];
            newParams[paramIdx] = { ...newParams[paramIdx], [field]: value };
            newRefs[eventIdx] = { ...newRefs[eventIdx], parameters: newParams };
            return { ...prev, event_references: newRefs };
        });
    }, []);

    /** 新增参数 */
    /**
     * 添加参数 (支持传入已有参数对象，否则添加空行)
     */
    const addParameter = useCallback((eventIndex: number, param?: Parameter) => {
        setRequest(prev => {
            const newRefs = [...prev.event_references];
            const currentParams = newRefs[eventIndex].parameters || [];

            // 如果传入了参数对象，检查是否已存在
            if (param) {
                if (currentParams.some(p => p.key === param.key)) {
                    // 也可以选择报错或忽略
                    return prev;
                }
                newRefs[eventIndex] = {
                    ...newRefs[eventIndex],
                    parameters: [...currentParams, param]
                };
            } else {
                // 原有逻辑：添加空行 (兼容旧代码，但建议逐步废弃)
                newRefs[eventIndex] = {
                    ...newRefs[eventIndex],
                    parameters: [
                        ...currentParams,
                        { key: '', type: 'String', desc: '', isRequired: false } // No ref_id for empty
                    ]
                };
            }
            return { ...prev, event_references: newRefs };
        });
    }, []);

    /** 删除参数 */
    const deleteParameter = useCallback((eventIdx: number, paramIdx: number) => {
        setRequest(prev => {
            const newRefs = [...prev.event_references];
            const newParams = newRefs[eventIdx].parameters.filter((_, i) => i !== paramIdx);
            newRefs[eventIdx] = { ...newRefs[eventIdx], parameters: newParams };
            return { ...prev, event_references: newRefs };
        });
    }, []);

    // ========================
    // 需求单操作（对接 workflowService）
    // ========================

    /** 保存草稿 */
    const saveDraft = useCallback(async () => {
        setIsSaving(true);
        try {
            const result = await workflowService.saveDraft(request);
            if (result.success) {
                setLastSaved(result.savedAt);
            }
            return result.savedAt;
        } catch (error) {
            console.error('[useWorkbench] Failed to save draft:', error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [request]);

    /** 提交审批 */
    const submitForReview = useCallback(async () => {
        setIsSaving(true);
        try {
            const result = await workflowService.submitForReview(request.id);
            if (result.success) {
                setRequest(prev => ({ ...prev, status: 'REVIEWING' }));
            }
            return result.success;
        } catch (error) {
            console.error('[useWorkbench] Failed to submit for review:', error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [request.id]);

    /** 获取事件历史版本（用于 Diff） */
    const getEventHistory = useCallback(async (eventId: string) => {
        try {
            return await workflowService.getEventHistory(eventId);
        } catch (error) {
            console.error('[useWorkbench] Failed to get event history:', error);
            return null;
        }
    }, []);

    /** 验证是否可提交 */
    const canSubmit = useMemo(() => {
        return request.event_references.length > 0 && !conflictInfo.hasDuplicates;
    }, [request.event_references.length, conflictInfo.hasDuplicates]);

    // ========================
    // 返回
    // ========================

    return {
        // 状态
        request,
        lastSaved,
        isReadOnly,
        conflictInfo,
        canSubmit,
        isLoading,
        isSaving,

        // 事件操作
        toggleExpand,
        addEventFromAsset,
        createNewEvent,
        copyEvent,
        deleteEvent,
        updateEventField,

        // 参数操作
        updateParameter,
        addParameter,
        deleteParameter,
        deleteEventsByIds,
        addParameterToEvents,

        // 需求单操作
        saveDraft,
        submitForReview,
        getEventHistory,
    };
};

export type UseWorkbenchReturn = ReturnType<typeof useWorkbench>;
