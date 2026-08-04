import { delayBetweenRequests, requestXivapi } from './client';

import { readXivapiPins } from './pins';

import { questIndexPath, writeJsonFile } from './paths';

import { xivapiSheetResponseSchema } from './schemas';

interface QuestIndexEntry {
  rowId: number;
  gameId?: string;
  name: string;
}

interface QuestIndexFile {
  source: {
    provider: 'xivapi';
    sheet: 'Quest';

    version: string;
    schema: string;

    language: 'en';
    generatedAt: string;
  };

  quests: QuestIndexEntry[];
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : undefined;
}

async function main(): Promise<void> {
  const pins = await readXivapiPins();

  const questEntries: QuestIndexEntry[] = [];

  let after: number | undefined;
  let pageNumber = 1;

  while (true) {
    console.log(`Fetching quest index page ${pageNumber}...`);

    const response = await requestXivapi({
      path: '/sheet/Quest',

      query: {
        fields: 'Name,Id',
        language: 'en',

        version: pins.version,
        schema: pins.schema,

        limit: 500,
        after,
      },

      responseSchema: xivapiSheetResponseSchema,
    });

    if (response.rows.length === 0) {
      break;
    }

    for (const row of response.rows) {
      const name = readOptionalString(row.fields.Name);

      if (!name) {
        continue;
      }

      questEntries.push({
        rowId: row.row_id,

        gameId: readOptionalString(row.fields.Id),

        name,
      });
    }

    after = response.rows[response.rows.length - 1]?.row_id;

    if (after === undefined) {
      break;
    }

    pageNumber += 1;

    await delayBetweenRequests();
  }

  const output: QuestIndexFile = {
    source: {
      provider: 'xivapi',
      sheet: 'Quest',

      version: pins.version,
      schema: pins.schema,

      language: 'en',
      generatedAt: new Date().toISOString(),
    },

    quests: questEntries,
  };

  await writeJsonFile(questIndexPath, output);

  console.log(
    `Indexed ${questEntries.length.toLocaleString()} named quest rows.`,
  );

  console.log(`Saved: ${questIndexPath}`);
}

await main();
