import * as z from 'zod';

import { DataLoadError } from './DataLoadError';
import { createPublicDataUrl } from './publicDataUrl';

export async function loadJson<TSchema extends z.ZodType>(
  relativePath: string,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const url = createPublicDataUrl(relativePath);

  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new DataLoadError(
      `Unable to request JSON data from "${relativePath}".`,
      relativePath,
      error,
    );
  }

  if (!response.ok) {
    throw new DataLoadError(
      `Unable to load "${relativePath}". The server returned ${response.status} ${response.statusText}.`,
      relativePath,
    );
  }

  let rawData: unknown;

  try {
    rawData = await response.json();
  } catch (error) {
    throw new DataLoadError(
      `"${relativePath}" does not contain valid JSON.`,
      relativePath,
      error,
    );
  }

  const result = schema.safeParse(rawData);

  if (!result.success) {
    throw new DataLoadError(
      [
        `"${relativePath}" does not match its expected data schema.`,
        z.prettifyError(result.error),
      ].join('\n\n'),
      relativePath,
      result.error,
    );
  }

  return result.data;
}
