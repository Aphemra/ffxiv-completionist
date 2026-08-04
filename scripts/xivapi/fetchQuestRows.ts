import path from 'node:path';

import { delayBetweenRequests, requestXivapi } from './client';

import { readXivapiPins } from './pins';

import { createSafePathSegment, xivapiCacheRoot, writeJsonFile } from './paths';

import { xivapiSheetResponseSchema } from './schemas';

function readRowsArgument(): number[] {
  const rowsArgumentIndex = process.argv.indexOf('--rows');

  const rawValue =
    rowsArgumentIndex >= 0 ? process.argv[rowsArgumentIndex + 1] : undefined;

  if (!rawValue) {
    throw new Error(
      [
        'One or more quest row IDs are required.',
        'Usage:',
        'npm run xivapi:fetch:quests -- --rows 12345,12346,12347',
      ].join('\n'),
    );
  }

  const rowIds = rawValue.split(',').map((value) => Number(value.trim()));

  if (rowIds.some((rowId) => !Number.isInteger(rowId) || rowId < 0)) {
    throw new Error(`Invalid row list: "${rawValue}"`);
  }

  return Array.from(new Set(rowIds));
}

function chunkValues<T>(values: readonly T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }

  return chunks;
}

async function main(): Promise<void> {
  const rowIds = readRowsArgument();
  const pins = await readXivapiPins();

  const versionSegment = createSafePathSegment(pins.version);

  const schemaSegment = createSafePathSegment(pins.schema);

  const outputDirectory = path.join(
    xivapiCacheRoot,
    versionSegment,
    schemaSegment,
    'Quest',
  );

  const chunks = chunkValues(rowIds, 20);

  let fetchedCount = 0;

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex];

    console.log(
      [
        `Fetching batch ${chunkIndex + 1}`,
        `of ${chunks.length}`,
        `(${chunk.length} rows)...`,
      ].join(' '),
    );

    const response = await requestXivapi({
      path: '/sheet/Quest',

      query: {
        rows: chunk.join(','),

        language: 'en',
        version: pins.version,
        schema: pins.schema,
      },

      responseSchema: xivapiSheetResponseSchema,
    });

    for (const row of response.rows) {
      const outputPath = path.join(outputDirectory, `${row.row_id}.json`);

      await writeJsonFile(outputPath, {
        source: {
          provider: 'xivapi',
          sheet: 'Quest',

          rowId: row.row_id,

          version: response.version,

          schema: response.schema,

          language: 'en',

          fetchedAt: new Date().toISOString(),
        },

        row,
      });

      fetchedCount += 1;
    }

    await delayBetweenRequests();
  }

  console.log(
    `Fetched ${fetchedCount} of ${rowIds.length} requested quest rows.`,
  );

  console.log(`Cache: ${outputDirectory}`);
}

await main();
