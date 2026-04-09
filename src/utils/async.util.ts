export class AsyncUtil {
  /**
   * Retries an async function a specified number of times.
   * @param fn The async function to retry.
   * @param retries Number of retry attempts.
   * @returns The result of the async function.
   * @throws The last error encountered if all attempts fail.
   */
  static async withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i += 1) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error('Unknown request error');

        if (i === retries) {
          break;
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error('Unexpected retry failure');
  }
}
