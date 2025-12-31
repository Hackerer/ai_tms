import { mockRequest } from './request';
import { MOCK_REQUESTS } from './mockData';
import type { TrackingRequest, EventChange } from '../types/workflow';

/**
 * 工作流服务
 * 处理埋点需求单（TrackingRequest）的 CRUD 操作
 */
class WorkflowService {
    /**
     * 获取需求单详情
     * @param id 需求单 ID
     */
    async getTrackingRequest(id: string): Promise<TrackingRequest | null> {
        const request = MOCK_REQUESTS.find(r => r.id === id);
        return mockRequest(request || null);
    }

    /**
     * 获取需求单列表
     * @param status 可选，按状态过滤
     */
    async getTrackingRequests(status?: string): Promise<TrackingRequest[]> {
        let requests = MOCK_REQUESTS;
        if (status) {
            requests = requests.filter(r => r.status === status);
        }
        return mockRequest(requests);
    }

    /**
     * 保存需求单草稿
     * @param request 需求单数据
     */
    async saveDraft(request: TrackingRequest): Promise<{ success: boolean; savedAt: string }> {
        // TODO: 实际 API 调用 PUT /api/requests/{id}
        const savedAt = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        console.log('[WorkflowService] Saving draft:', request.id);
        return mockRequest({ success: true, savedAt });
    }

    /**
     * 提交需求单进入审批流
     * @param id 需求单 ID
     */
    async submitForReview(id: string): Promise<{ success: boolean; newStatus: string }> {
        // TODO: 实际 API 调用 POST /api/requests/{id}/submit
        console.log('[WorkflowService] Submitting for review:', id);
        return mockRequest({ success: true, newStatus: 'Reviewing' });
    }

    /**
     * 创建新需求单
     * @param data 需求单数据（不含 ID）
     */
    async createTrackingRequest(data: Omit<TrackingRequest, 'id'>): Promise<TrackingRequest> {
        const newRequest: TrackingRequest = {
            ...data,
            id: `REQ-${Date.now()}`,
        };
        // TODO: 实际 API 调用 POST /api/requests
        console.log('[WorkflowService] Creating new request:', newRequest.id);
        return mockRequest(newRequest);
    }

    /**
     * 删除需求单
     * @param id 需求单 ID
     */
    async deleteTrackingRequest(id: string): Promise<{ success: boolean }> {
        // TODO: 实际 API 调用 DELETE /api/requests/{id}
        console.log('[WorkflowService] Deleting request:', id);
        return mockRequest({ success: true });
    }

    /**
     * 获取事件的历史版本（用于 Diff 对比）
     * @param eventId 事件 ID
     */
    async getEventHistory(eventId: string): Promise<EventChange | null> {
        // TODO: 实际 API 调用 GET /api/events/{id}/history
        // 返回事件的上一个已发布版本
        const mockHistory: Record<string, EventChange> = {
            'EVT-001': {
                id: 'EVT-001',
                name: 'cart_add_click',
                operation: 'edit',
                description: '购物车添加按钮点击',
                isExpanded: false,
                parameters: [
                    { key: 'item_id', type: 'String', desc: '商品唯一ID', isRequired: true },
                    { key: 'price', type: 'String', desc: '商品价格', isRequired: true },
                    { key: 'old_field', type: 'String', desc: '旧字段(将被删除)', isRequired: false }
                ]
            }
        };
        return mockRequest(mockHistory[eventId] || null);
    }
}

export const workflowService = new WorkflowService();
