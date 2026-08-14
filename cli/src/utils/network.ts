export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  backoffFactor?: number;
  retryOnStatuses?: number[];
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 1_000;
const DEFAULT_RETRY_STATUSES = [408, 429, 500, 502, 503, 504];

export async function requestWithRetry(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    backoffFactor = 2,
    retryOnStatuses = DEFAULT_RETRY_STATUSES,
    ...fetchOpts
  } = options;

  let lastError: Error | null = null;
  let delay = retryDelayMs;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...fetchOpts,
        signal: fetchOpts.signal || controller.signal,
      });
      clearTimeout(timer);

      if (attempt < retries && retryOnStatuses.includes(res.status)) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= backoffFactor;
        continue;
      }

      return res;
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= backoffFactor;
        continue;
      }
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error(`Request timed out after ${timeoutMs / 1000}s to ${url}`);
  }

  throw lastError || new Error(`Failed to connect to ${url}`);
}

export async function fetchJson<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const res = await requestWithRetry(url, options);
  if (!res.ok) {
    let errorDetail = "";
    try {
      const errJson = await res.json();
      errorDetail =
        errJson.message || errJson.error || errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = await res.text().catch(() => res.statusText);
    }
    const err: any = new Error(
      `HTTP ${res.status} from ${new URL(url).hostname}: ${errorDetail || res.statusText}`
    );
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}
