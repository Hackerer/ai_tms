import { describe, it, expect } from 'vitest';
import { workflowService } from '../services/workflowService';

describe('workflowService', () => {
    describe('getTrackingRequest', () => {
        it('should return request when found', async () => {
            const result = await workflowService.getTrackingRequest('REQ-1001');
            expect(result).not.toBeNull();
            expect(result?.id).toBe('REQ-1001');
            expect(result?.title).toBe('支付漏斗优化');
        });

        it('should return null when not found', async () => {
            const result = await workflowService.getTrackingRequest('NON-EXISTENT');
            expect(result).toBeNull();
        });
    });

    describe('getTrackingRequests', () => {
        it('should return all requests', async () => {
            const result = await workflowService.getTrackingRequests();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should filter by status', async () => {
            const result = await workflowService.getTrackingRequests('Draft');
            expect(result.every(r => r.status === 'Draft')).toBe(true);
        });
    });

    describe('saveDraft', () => {
        it('should return success with savedAt time', async () => {
            const mockRequest = {
                id: 'REQ-TEST',
                title: 'Test Request',
                status: 'Draft' as const,
                created_user_id: 'USER-001',
                doc_url: '',
                event_references: []
            };
            const result = await workflowService.saveDraft(mockRequest);
            expect(result.success).toBe(true);
            expect(result.savedAt).toBeDefined();
        });
    });

    describe('submitForReview', () => {
        it('should return success with new status', async () => {
            const result = await workflowService.submitForReview('REQ-1001');
            expect(result.success).toBe(true);
            expect(result.newStatus).toBe('Reviewing');
        });
    });

    describe('createTrackingRequest', () => {
        it('should create request with generated ID', async () => {
            const data = {
                title: 'New Request',
                status: 'Draft' as const,
                created_user_id: 'USER-002',
                doc_url: '',
                event_references: []
            };
            const result = await workflowService.createTrackingRequest(data);
            expect(result.id).toMatch(/^REQ-\d+$/);
            expect(result.title).toBe('New Request');
        });
    });

    describe('deleteTrackingRequest', () => {
        it('should return success', async () => {
            const result = await workflowService.deleteTrackingRequest('REQ-1001');
            expect(result.success).toBe(true);
        });
    });

    describe('getEventHistory', () => {
        it('should return history for known event', async () => {
            const result = await workflowService.getEventHistory('EVT-001');
            expect(result).not.toBeNull();
            expect(result?.id).toBe('EVT-001');
            expect(result?.name).toBe('cart_add_click');
        });

        it('should return null for unknown event', async () => {
            const result = await workflowService.getEventHistory('UNKNOWN');
            expect(result).toBeNull();
        });
    });
});
