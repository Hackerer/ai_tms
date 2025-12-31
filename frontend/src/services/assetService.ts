import { mockRequest } from './request';
import { MOCK_PARAMETERS, MOCK_EVENTS, MOCK_PAGES } from './mockData';
import type { Parameter, Event, Page } from '../types/asset';

/**
 * 资产服务
 * 处理埋点资产（参数、事件、页面）的数据获取
 */
class AssetService {
    /**
     * 获取参数列表
     */
    async getParameters(): Promise<Parameter[]> {
        return mockRequest(MOCK_PARAMETERS);
    }

    /**
     * 获取事件列表
     * @param pageId 可选，按页面过滤
     */
    async getEvents(pageId?: string): Promise<Event[]> {
        const events = pageId
            ? MOCK_EVENTS.filter(e => e.page_id === pageId)
            : MOCK_EVENTS;
        return mockRequest(events);
    }

    /**
     * 获取页面列表
     * @param appId 应用 ID
     */
    async getPages(appId: string): Promise<Page[]> {
        const pages = MOCK_PAGES.filter(p => p.app_id === appId);
        return mockRequest(pages);
    }
}

export const assetService = new AssetService();
