export type WorkflowStatus = 'DRAFT' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'APPLIED';
export type OperationType = 'create' | 'edit' | 'delete';

export interface WorkflowParameter {
    key: string;
    type: string;
    desc: string;
    isRequired: boolean;
    ref_id?: string;
    category?: 'global' | 'business';
}

export interface EventChange {
    id: string;
    name: string;
    operation: OperationType;
    description: string;
    page_id?: string;
    event_type?: string;
    parameters: WorkflowParameter[];
    isExpanded: boolean;
    screenshot_url?: string; // 埋点截图URL
}

export interface TrackingRequest {
    id: string;
    title: string;
    status: WorkflowStatus;
    created_user_id: string;
    event_references: EventChange[];
    doc_url: string;
    created_at?: string;
    group?: string;
}

export interface ApprovalTask {
    id: string;
    node_name: string;
    approver_user_id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    comment?: string;
    created_at: string;
}
