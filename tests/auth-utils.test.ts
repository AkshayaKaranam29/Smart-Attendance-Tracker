import { signToken, verifyToken } from '../lib/auth-utils'

describe('Auth Utils', () => {
    it('should sign and verify a token successfully', async () => {
        // Override secret for testing since env might be missing
        process.env.JWT_SECRET = 'test-secret';

        const payload = {
            id: 'usr_123',
            role: 'student',
            name: 'John Doe',
            enrollmentNo: 'EN12345'
        };

        const token = await signToken(payload);
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');

        const decoded = await verifyToken(token);
        expect(decoded).toBeDefined();
        expect(decoded?.id).toBe(payload.id);
        expect(decoded?.role).toBe(payload.role);
        expect(decoded?.name).toBe(payload.name);
        expect(decoded?.enrollmentNo).toBe(payload.enrollmentNo);
    });

    it('should return null for an invalid token', async () => {
        const decoded = await verifyToken('invalid.token.string');
        expect(decoded).toBeNull();
    });
});
