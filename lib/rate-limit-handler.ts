/**
 * A utility for handling API rate limiting with zero-delay retry logic
 */
export class RateLimitHandler {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private maxRetries = 10; // Increase max retries for better reliability

  /**
   * Execute a function with immediate retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName = "operation"
  ): Promise<T> {
    // Execute immediately without queueing for all operations
    try {
      return await operation();
    } catch (err: any) {
      // Only use queue for rate limit errors
      if (err?.message?.includes("Rate limit")) {
        return this.queueOperation(operation, operationName);
      }
      throw err;
    }
  }

  private async queueOperation<T>(
    operation: () => Promise<T>,
    operationName = "operation"
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        let retries = 0;
        let lastError: Error | null = null;

        while (retries <= this.maxRetries) {
          try {
            const result = await operation();
            resolve(result);
            return;
          } catch (err: any) {
            lastError = err;

            if (err?.message?.includes("Rate limit")) {
              retries++;
              if (retries <= this.maxRetries) {
                // No delay between retries - retry as fast as possible
                // Only log every few retries to reduce console noise
                if (retries % 3 === 0) {
                  console.warn(
                    `Rate limit retry ${retries}/${this.maxRetries} for ${operationName}`
                  );
                }
                continue;
              }
            } else {
              break;
            }
          }
        }
        reject(lastError);
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const request = this.queue.shift();

    try {
      await request?.();
    } catch (error) {
      console.error("Error processing queued request:", error);
    }

    // Process next request immediately with no delay
    this.processQueue();
  }
}

// Create a singleton instance
export const rateLimitHandler = new RateLimitHandler();
