export type WorkflowStatus = 'Draft' | 'Reviewing' | 'Approved' | 'Rejected' | 'Applied';
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
    status: 'Pending' | 'Approved' | 'Rejected';
    comment?: string;
    created_at: string;
}
