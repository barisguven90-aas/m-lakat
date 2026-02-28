import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export default anthropic;

/**
 * Safe wrapper for Anthropic API calls with retry and graceful degradation.
 * Retries once on transient errors, returns fallback on persistent failures.
 */
export async function safeAnthropicCall<T>(
    callFn: () => Promise<T>,
    fallbackFn: () => T,
    options: { retries?: number; retryDelayMs?: number } = {}
): Promise<{ data: T; fromFallback: boolean }> {
    const { retries = 1, retryDelayMs = 1000 } = options;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const data = await callFn();
            return { data, fromFallback: false };
        } catch (error: any) {
            const statusCode = error?.status || error?.statusCode;
            const isRetryable = !statusCode || statusCode >= 500 || statusCode === 429;

            if (attempt < retries && isRetryable) {
                console.warn(`Anthropic API call failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${retryDelayMs}ms...`, error?.message);
                await new Promise(r => setTimeout(r, retryDelayMs * (attempt + 1)));
                continue;
            }

            console.error('Anthropic API call failed permanently, using fallback:', error?.message);
            return { data: fallbackFn(), fromFallback: true };
        }
    }

    // Should never reach here, but TypeScript needs it
    return { data: fallbackFn(), fromFallback: true };
}
