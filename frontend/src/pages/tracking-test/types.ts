/**
 * 验证条目接口
 */
export interface ValidationEvent {
    id: string; // 本地唯一ID
    eventName: string;
    properties: Record<string, any>;
    status: 'success' | 'failed' | 'warning';
    errors: Array<{
        type: string;
        message: string;
        severity: 'error' | 'warning';
    }>;
    timestamp: string;
    metadata_id?: string;
    expectedProps?: string[];
}

/**
 * 验证统计接口
 */
export interface ValidationStats {
    total: number;
    success: number;
    failed: number;
    warning: number;
}

/**
 * 测试模式类型
 */
export type TestMode = 'quick' | 'metadata' | 'request';

/**
 * 需求单摘要接口
 */
export interface TrackingRequest {
    id: string;
    title: string;
    status: string;
    created_at: string;
}
