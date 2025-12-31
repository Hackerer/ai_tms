import { describe, it, expect } from 'vitest';
import { mockRequest, RequestError } from '../services/request';

describe('request.ts - mockRequest', () => {
    it('should return data after delay', async () => {
        const testData = { id: 1, name: 'test' };
        const result = await mockRequest(testData, 100);
        expect(result).toEqual(testData);
    });

    it('should handle null data', async () => {
        const result = await mockRequest(null, 100);
        expect(result).toBeNull();
    });

    it('should handle array data', async () => {
        const testData = [1, 2, 3];
        const result = await mockRequest(testData, 100);
        expect(result).toEqual([1, 2, 3]);
    });
});

describe('RequestError', () => {
    it('should create error with message and code', () => {
        const error = new RequestError('测试错误', 400);
        expect(error.message).toBe('测试错误');
        expect(error.code).toBe(400);
        expect(error.name).toBe('RequestError');
    });

    it('should use default code 500', () => {
        const error = new RequestError('服务器错误');
        expect(error.code).toBe(500);
    });
});
