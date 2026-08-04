import { requestXivapi } from './client';

import { writeJsonFile, xivapiPinsPath } from './paths';

import { xivapiSheetResponseSchema, type XivapiPins } from './schemas';

async function main(): Promise<void> {
  console.log('Resolving current XIVAPI pins...');

  const response = await requestXivapi({
    path: '/sheet/Quest',

    query: {
      fields: 'Name,Id',
      language: 'en',
      limit: 1,
    },

    responseSchema: xivapiSheetResponseSchema,
  });

  const pins: XivapiPins = {
    version: response.version,
    schema: response.schema,
    capturedAt: new Date().toISOString(),
  };

  await writeJsonFile(xivapiPinsPath, pins);

  console.log(`Game version: ${pins.version}`);

  console.log(`Schema: ${pins.schema}`);

  console.log(`Saved: ${xivapiPinsPath}`);
}

await main();
