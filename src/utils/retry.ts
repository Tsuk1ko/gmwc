import { sleep } from './sleep';

export const retryAsync = async <T>(
  fn: () => Promise<T>,
  onError?: (e: any) => any,
  retry = 2,
  interval = 3000,
): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (retry <= 0) throw e;
    onError?.(e);
    await sleep(interval);
    return await retryAsync(fn, onError, retry - 1);
  }
};
