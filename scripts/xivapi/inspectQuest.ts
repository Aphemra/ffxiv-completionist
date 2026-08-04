import path from 'node:path';

import { requestXivapi } from './client';

import { readXivapiPins } from './pins';

import { xivapiCacheRoot, writeJsonFile } from './paths';

import { xivapiRowResponseSchema } from './schemas';

function readRowArgument(): number {
  const rowArgumentIndex = process.argv.indexOf('--row');

  const rawValue =
    rowArgumentIndex >= 0 ? process.argv[rowArgumentIndex + 1] : undefined;

  const rowId = Number(rawValue);

  if (!Number.isInteger(rowId) || rowId < 0) {
    throw new Error(
      [
        'A valid quest row ID is required.',
        'Usage:',
        'npm run xivapi:inspect:quest -- --row 12345',
      ].join('\n'),
    );
  }

  return rowId;
}

async function main(): Promise<void> {
  const rowId = readRowArgument();
  const pins = await readXivapiPins();

  console.log(`Fetching complete Quest row ${rowId}...`);

  const response = await requestXivapi({
    path: `/sheet/Quest/${rowId}`,

    query: {
      language: 'en',
      version: pins.version,
      schema: pins.schema,
    },

    responseSchema: xivapiRowResponseSchema,
  });

  const outputPath = path.join(
    xivapiCacheRoot,
    'inspection',
    `quest-${rowId}.json`,
  );

  await writeJsonFile(outputPath, response);

  console.log(`Saved: ${outputPath}`);
}

await main();
