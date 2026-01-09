export type ParameterType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'OBJECT' | 'ARRAY';
export type AssetCategory = 'global' | 'domain' | 'app';

export interface Parameter {
    id: string;
    tenant_id: string;
    name: string;
    data_type: ParameterType;
    category: AssetCategory;
    description: string;
    is_required: boolean;
    enum_options: Array<{ value: string; label: string; description: string }>;
    created_at: string;
    used_by_events?: number;
}

export interface Event {
    id: string;
    name: string;
    type: string;
    page_id: string;
    description: string;
    status: 'ONLINE' | 'REVIEWING' | 'OFFLINE';
    params_count: number;
    properties?: Parameter[];
}

export interface Page {
    id: string;
    tenant_id: string;
    app_id: string;
    parent_id?: string | null;
    name: string;
    path: string;
    module: string;
    description: string;
    created_at: string;
    children?: Page[];
    event_count?: number;
}

export interface TreeNode {
    id: string;
    name: string;
    type: 'app' | 'module' | 'page';
    parent_id?: string | null;
    children?: TreeNode[];
    event_count?: number;
    path?: string;
    module?: string;
    app_id?: string;
}
