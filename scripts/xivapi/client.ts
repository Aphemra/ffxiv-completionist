import * as z from 'zod';

const XIVAPI_BASE_URL = 'https://v2.xivapi.com/api';

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export class XivapiRequestError extends Error {
  public readonly status: number;
  public readonly url: string;
  public readonly responseText: string;

  constructor(status: number, url: string, responseText: string) {
    super(
      [`XIVAPI request failed with HTTP ${status}.`, url, responseText].join(
        '\n',
      ),
    );

    this.name = 'XivapiRequestError';
    this.status = status;
    this.url = url;
    this.responseText = responseText;
  }
}

interface XivapiRequestOptions<TSchema extends z.ZodType> {
  path: string;

  query?: Readonly<Record<string, string | number | undefined>>;

  responseSchema: TSchema;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function createRequestUrl(
  requestPath: string,
  query: Readonly<Record<string, string | number | undefined>> | undefined,
): URL {
  const url = new URL(`${XIVAPI_BASE_URL}${requestPath}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url;
}

function getRetryDelay(response: Response, attempt: number): number {
  const retryAfter = response.headers.get('retry-after');

  if (retryAfter) {
    const retryAfterSeconds = Number(retryAfter);

    if (Number.isFinite(retryAfterSeconds)) {
      return retryAfterSeconds * 1000;
    }
  }

  return 750 * 2 ** attempt;
}

export async function requestXivapi<TSchema extends z.ZodType>(
  options: XivapiRequestOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  const url = createRequestUrl(options.path, options.query);

  const maximumAttempts = 4;

  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    const abortController = new AbortController();

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 45_000);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },

        signal: abortController.signal,
      });

      if (!response.ok) {
        const responseText = await response.text();

        if (
          RETRYABLE_STATUS_CODES.has(response.status) &&
          attempt < maximumAttempts - 1
        ) {
          await wait(getRetryDelay(response, attempt));

          continue;
        }

        throw new XivapiRequestError(
          response.status,
          url.toString(),
          responseText,
        );
      }

      const rawData = (await response.json()) as unknown;

      return options.responseSchema.parse(rawData);
    } catch (error) {
      if (
        attempt < maximumAttempts - 1 &&
        error instanceof Error &&
        error.name === 'AbortError'
      ) {
        await wait(750 * 2 ** attempt);
        continue;
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(`XIVAPI request failed after ${maximumAttempts} attempts.`);
}

export async function delayBetweenRequests(): Promise<void> {
  await wait(150);
}
