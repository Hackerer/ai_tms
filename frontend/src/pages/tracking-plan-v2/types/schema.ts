// 埋点方案生命周期状态枚举
export type PlanStatus = 'DRAFT' | 'REVIEW' | 'LOCKED' | 'TESTING' | 'PUBLISHED';

// 埋点参数类型
export type ParameterType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'ENUM' | 'ARRAY' | 'OBJECT';

// 埋点参数定义
export interface TrackingParameter {
    id: string;
    name: string;        // 参数中文名
    identifier: string;  // 参数代码标识符 (e.g. user_id)
    type: ParameterType;
    description?: string;
    isRequired: boolean;
    exampleValue?: string;
    enumValues?: string[]; // 仅当 type 为 ENUM 时有效
}

// 埋点事件定义
export interface TrackingEvent {
    id: string;
    name: string;        // 事件中文名
    identifier: string;  // 事件代码标识符 (e.g. click_button)
    description?: string;
    triggerCondition?: string; // 触发条件
    screenshot_url?: string | null; // 截图URL
    operation?: 'create' | 'edit' | 'delete'; // 操作类型
    parameters: TrackingParameter[];
}

// 埋点方案基本信息
export interface TrackingPlan {
    id: string;
    name: string;
    description: string;
    status: PlanStatus;
    version: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    eventCount: number;
    events: TrackingEvent[]; // 核心：包含的事件列表
}

// 状态配置 (用于 UI 展示)
export const StatusConfig: Record<PlanStatus, { label: string; color: string; icon: string }> = {
    DRAFT: { label: '草稿', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', icon: 'Edit' },
    REVIEW: { label: '评审中', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: 'Eye' },
    LOCKED: { label: '开发锁定', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: 'Lock' },
    TESTING: { label: '测试中', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: 'Flask' },
    PUBLISHED: { label: '已发布', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: 'Check' },
};
