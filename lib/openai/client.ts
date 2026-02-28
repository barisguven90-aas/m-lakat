import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

/**
 * Safe wrapper for OpenAI API calls with retry and graceful degradation.
 */
export async function safeOpenAICall<T>(
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
                console.warn(`OpenAI API call failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${retryDelayMs}ms...`, error?.message);
                await new Promise(r => setTimeout(r, retryDelayMs * (attempt + 1)));
                continue;
            }

            console.error('OpenAI API call failed permanently, using fallback:', error?.message);
            return { data: fallbackFn(), fromFallback: true };
        }
    }

    return { data: fallbackFn(), fromFallback: true };
}
