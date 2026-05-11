export class RateLimiter {
    private cache: Map<string, { count: number; expiresAt: number }>;
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests: number, windowMs: number) {
        this.cache = new Map();
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    check(identifier: string): boolean {
        const now = Date.now();
        const record = this.cache.get(identifier);

        if (!record) {
            this.cache.set(identifier, { count: 1, expiresAt: now + this.windowMs });
            return true;
        }

        if (now > record.expiresAt) {
            this.cache.set(identifier, { count: 1, expiresAt: now + this.windowMs });
            return true;
        }

        if (record.count >= this.maxRequests) {
            return false;
        }

        record.count += 1;
        this.cache.set(identifier, record);
        return true;
    }
}
