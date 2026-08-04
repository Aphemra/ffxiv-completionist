import path from 'node:path';

import { requestXivapi } from './client';

import { readXivapiPins } from './pins';

import { xivapiCacheRoot, writeJsonFile } from './paths';

import { QUEST_REVIEW_FIELDS } from './questReviewFields';

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
        '',
        'Usage:',
        'npm run xivapi:inspect:quest -- --row 65545',
        '',
        'To deliberately download the enormous full response:',
        'npm run xivapi:inspect:quest -- --row 65545 --full',
      ].join('\n'),
    );
  }

  return rowId;
}

async function main(): Promise<void> {
  const rowId = readRowArgument();

  const useFullResponse = process.argv.includes('--full');

  const pins = await readXivapiPins();

  const mode = useFullResponse ? 'full' : 'focused';

  console.log([`Fetching ${mode} Quest row`, `${rowId}...`].join(' '));

  const response = await requestXivapi({
    path: `/sheet/Quest/${rowId}`,

    query: {
      language: 'en',
      version: pins.version,
      schema: pins.schema,

      fields: useFullResponse ? undefined : QUEST_REVIEW_FIELDS,
    },

    responseSchema: xivapiRowResponseSchema,
  });

  const outputPath = path.join(
    xivapiCacheRoot,
    'inspection',
    `quest-${rowId}.${mode}.json`,
  );

  await writeJsonFile(outputPath, response);

  console.log(`Saved: ${outputPath}`);
}

await main();
