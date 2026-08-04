import { xivapiPinsSchema, type XivapiPins } from './schemas';

import { readJsonFile, xivapiPinsPath } from './paths';

export async function readXivapiPins(): Promise<XivapiPins> {
  let rawData: unknown;

  try {
    rawData = await readJsonFile(xivapiPinsPath);
  } catch {
    throw new Error(
      ['No XIVAPI pin file exists.', 'Run "npm run xivapi:pin" first.'].join(
        '\n',
      ),
    );
  }

  return xivapiPinsSchema.parse(rawData);
}
