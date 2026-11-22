/**
 * Runs async work with a bounded number of concurrent workers.
 * Avoids firing hundreds of downloads at once from a single effect.
 */
export async function mapLimit<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<void>,
  shouldContinue?: () => boolean,
): Promise<void> {
  if (items.length === 0) return;

  let cursor = 0;
  const workerCount = Math.min(Math.max(1, limit), items.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (cursor < items.length) {
        if (shouldContinue && !shouldContinue()) return;
        const item = items[cursor++];
        await worker(item);
      }
    }),
  );
}
