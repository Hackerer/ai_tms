import '@testing-library/jest-dom';
import { beforeAll, afterAll } from 'vitest';

// 全局测试设置
beforeAll(() => {
    // 测试开始前的设置
});

afterAll(() => {
    // 测试结束后的清理
});

// Mock matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
});
