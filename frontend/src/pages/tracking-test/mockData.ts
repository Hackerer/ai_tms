import type { ValidationEvent } from './types';

export const MOCK_EVENTS: Partial<ValidationEvent>[] = [
    {
        eventName: 'app_launch',
        status: 'success',
        properties: {
            os: 'iOS',
            version: '5.4.0',
            device_model: 'iPhone 15 Pro'
        },
        expectedProps: ['os', 'version', 'device_model'],
        errors: []
    },
    {
        eventName: 'user_login',
        status: 'warning',
        properties: {
            userid: 'USER_9981', // 触发纠错：userid -> user_id
            login_type: 'wechat'
        },
        expectedProps: ['user_id', 'login_type'],
        errors: [
            {
                type: 'undefined_parameter',
                message: '参数 usid 未在元数据中定义',
                severity: 'warning'
            }
        ]
    },
    {
        eventName: 'add_to_cart',
        status: 'failed',
        properties: {
            item_id: 'sku_99821',
            price: '99.0',
            currency: 'CNY'
        },
        expectedProps: ['item_id', 'price', 'currency', 'quantity'],
        errors: [
            {
                type: 'type_mismatch',
                message: '参数 price 类型不符 (期待 Number, 实际 String)',
                severity: 'error'
            }
        ]
    },
    {
        eventName: 'purchase_complete',
        status: 'failed',
        properties: {
            order_id: 'ORD-882731',
        },
        expectedProps: ['order_id', 'total_amount', 'transaction_id'],
        errors: [
            {
                type: 'missing_parameter',
                message: '缺少必传参数: total_amount',
                severity: 'error'
            }
        ]
    },
    {
        eventName: 'page_view_home',
        status: 'success',
        properties: {
            page_name: 'homepage',
            stay_duration: 1205
        },
        expectedProps: ['page_name', 'stay_duration', 'referrer'],
        errors: []
    }
];
