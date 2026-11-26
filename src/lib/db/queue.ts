let queue: Promise<void> = Promise.resolve();

/**
 * Runs database maintenance tasks one at a time. Scans and full library loads
 * both rewrite several tables, so overlapping transactions can make the app
 * fail immediately after a scan.
 */
export function enqueueDbTask<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task);
  // Keep the queue alive after a failed task so later work is not blocked.
  queue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
