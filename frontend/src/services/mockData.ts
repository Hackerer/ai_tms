import type { Parameter, Event, Page } from '../types/asset';
import type { TrackingRequest } from '../types/workflow';

/**
 * Mock 参数数据
 */
export const MOCK_PARAMETERS: Parameter[] = [
    {
        id: 'PROP-001',
        tenant_id: 'TENANT-001',
        name: 'user_id',
        data_type: 'STRING',
        category: 'global',
        description: '用户唯一标识符',
        is_required: true,
        enum_options: [],
        created_at: '2025-01-01 10:00:00',
        used_by_events: 156,
    },
    {
        id: 'PROP-002',
        tenant_id: 'TENANT-001',
        name: 'timestamp',
        data_type: 'NUMBER',
        category: 'global',
        description: '事件发生时间戳(毫秒)',
        is_required: true,
        enum_options: [],
        created_at: '2025-01-01 10:00:00',
        used_by_events: 156,
    },
    {
        id: 'PROP-003',
        tenant_id: 'TENANT-001',
        name: 'platform',
        data_type: 'STRING',
        category: 'global',
        description: '终端平台类型',
        is_required: true,
        enum_options: [
            { value: 'iOS', label: 'iOS', description: 'Apple iOS 设备' },
            { value: 'Android', label: 'Android', description: 'Android 设备' },
            { value: 'Web', label: 'Web', description: '网页端' },
        ],
        created_at: '2025-01-01 10:00:00',
        used_by_events: 156,
    },
    {
        id: 'PROP-004',
        tenant_id: 'TENANT-001',
        name: 'order_id',
        data_type: 'STRING',
        category: 'domain',
        description: '订单唯一ID',
        is_required: true,
        enum_options: [],
        created_at: '2025-01-15 14:30:00',
        used_by_events: 23,
    },
    {
        id: 'PROP-005',
        tenant_id: 'TENANT-001',
        name: 'payment_method',
        data_type: 'STRING',
        category: 'domain',
        description: '支付方式',
        is_required: false,
        enum_options: [
            { value: 'alipay', label: '支付宝', description: '' },
            { value: 'wechat', label: '微信支付', description: '' },
            { value: 'card', label: '银行卡', description: '' },
        ],
        created_at: '2025-01-15 14:30:00',
        used_by_events: 12,
    },
];

/**
 * Mock 事件数据
 */
export const MOCK_EVENTS: Event[] = [
    { id: 'EVT-10023', name: 'hot_sale_click', type: '点击事件', params_count: 5, status: 'ONLINE', page_id: 'PAGE-001', description: '热销商品点击' },
    { id: 'EVT-10024', name: 'banner_show', type: '展现事件', params_count: 3, status: 'ONLINE', page_id: 'PAGE-001', description: 'Banner 展现' },
    { id: 'EVT-10025', name: 'search_submit', type: '点击事件', params_count: 4, status: 'ONLINE', page_id: 'PAGE-002', description: '搜索提交' },
    { id: 'EVT-10026', name: 'item_detail_view', type: 'PageView', params_count: 6, status: 'ONLINE', page_id: 'PAGE-003', description: '商品详情页浏览' },
    { id: 'EVT-10027', name: 'add_to_cart', type: '点击事件', params_count: 5, status: 'ONLINE', page_id: 'PAGE-004', description: '加入购物车' },
    { id: 'EVT-10028', name: 'checkout_click', type: '点击事件', params_count: 3, status: 'REVIEWING', page_id: 'PAGE-004', description: '结算点击' },
];

/**
 * Mock 页面数据
 */
export const MOCK_PAGES: Page[] = [
    { id: 'PAGE-001', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '热销看板', path: '/home/hot-sales', parent_id: null, module: '首页模块', description: '展示热销商品的看板页面', created_at: '2025-01-01 10:00:00', event_count: 6 },
    { id: 'PAGE-002', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '搜索结果页', path: '/home/search', parent_id: null, module: '首页模块', description: '商品搜索结果展示页', created_at: '2025-01-01 10:00:00', event_count: 4 },
    { id: 'PAGE-003', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '商品详情页', path: '/shop/detail', parent_id: null, module: '购物中心', description: '单个商品的详细信息页', created_at: '2025-01-05 14:20:00', event_count: 8 },
    { id: 'PAGE-004', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '购物车', path: '/shop/cart', parent_id: null, module: '购物中心', description: '用户购物车管理页面', created_at: '2025-01-05 14:20:00', event_count: 3 },
    { id: 'PAGE-005', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '订单确认', path: '/shop/checkout', parent_id: 'PAGE-004', module: '购物中心', description: '订单确认与支付页面', created_at: '2025-01-10 09:30:00', event_count: 5 },
    { id: 'PAGE-006', tenant_id: 'TENANT-001', app_id: 'APP-001', name: '个人中心', path: '/profile', parent_id: null, module: '个人中心', description: '用户个人信息管理', created_at: '2025-01-15 16:45:00', event_count: 2 },
];

/**
 * Mock 需求单数据
 */
export const MOCK_REQUESTS: TrackingRequest[] = [
    {
        id: 'REQ-1001',
        title: '支付漏斗优化',
        status: 'REVIEWING',
        created_user_id: 'USR-01',
        doc_url: 'https://wiki.company.com/view/123',
        created_at: '2025-01-20 10:30:00',
        group: '交易链路组',
        event_references: [
            {
                id: 'EVT-10023',
                name: 'hot_sale_click',
                operation: 'edit',
                description: '增加商品分类参数',
                parameters: [
                    { key: 'category_id', type: 'String', desc: '商品分类', isRequired: true }
                ],
                isExpanded: false
            }
        ]
    },
    {
        id: 'REQ-1002',
        title: '首页改版埋点',
        status: 'DRAFT',
        created_user_id: 'USR-01',
        doc_url: '',
        created_at: '2025-01-22 14:15:00',
        group: '营销增长组',
        event_references: [
            {
                id: 'EVT-NEW-001',
                name: 'new_banner_click',
                operation: 'create',
                description: '新增首页 Banner 点击事件',
                event_type: 'Click',
                page_id: 'PAGE-001',
                parameters: [
                    { key: 'user_id', type: 'String', desc: '用户ID', isRequired: true, ref_id: 'PROP-001', category: 'global' },
                    { key: 'page_id', type: 'String', desc: '页面ID', isRequired: true, ref_id: 'PROP-009', category: 'global' }, // Assuming PROP-009 exists or just dummy
                    { key: 'item_id', type: 'String', desc: '商品ID', isRequired: false, ref_id: 'PROP-005', category: 'business' }
                ],
                isExpanded: true
            }
        ]
    }
];
