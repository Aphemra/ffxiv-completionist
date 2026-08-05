import path from 'node:path';

import * as z from 'zod';

import {
  delayBetweenRequests,
  requestXivapi,
  XivapiRequestError,
} from './client';
import type { InterpretedQuestDutyReference } from './interpretQuestUnlocks';
import {
  createSafePathSegment,
  readJsonFile,
  writeJsonFile,
  xivapiCacheRoot,
} from './paths';
import { readXivapiPins } from './pins';
import { xivapiSheetResponseSchema } from './schemas';

type JsonObject = Record<string, unknown>;

export interface ResolvedQuestDuty {
  contentFinderConditionRowId: number;
  contentRowId: number;

  id: string;
  name: string;
  type: string;

  relationship: 'required' | 'unlocked';

  level: number;

  minimumItemLevel?: number;
  levelSync?: number;
  itemLevelSync?: number;
  partySize?: number;

  highEnd: boolean;
}

interface ResolveQuestDutyOptions {
  offline?: boolean;
}

const cachedDutySchema = z.strictObject({
  contentFinderConditionRowId: z.number().int().positive(),
  contentRowId: z.number().int().positive(),

  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  type: z.string().trim().min(1),

  level: z.number().int().positive(),

  minimumItemLevel: z.number().int().positive().optional(),
  levelSync: z.number().int().positive().optional(),
  itemLevelSync: z.number().int().positive().optional(),
  partySize: z.number().int().positive().optional(),

  highEnd: z.boolean(),
});

type CachedDuty = z.infer<typeof cachedDutySchema>;

const CONTENT_FINDER_FIELDS = [
  'Name',

  'Content@as(raw)',
  'ContentLinkType',

  'ContentType.Name',
  'ContentType@as(raw)',

  'ContentMemberType@as(raw)',
  'QueueMaxPlayers',

  'ClassJobLevelRequired',
  'ClassJobLevelSync',

  'ItemLevelRequired',
  'ItemLevelSync',

  'HighEndDuty',
].join(',');

const CONTENT_MEMBER_PARTY_SIZES = new Map<number, number>([
  [2, 4],
  [3, 8],
  [4, 24],
]);

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function readInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value)
    ? value
    : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asObject(value: unknown): JsonObject | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as JsonObject;
}

function capitalizeName(value: string): string {
  if (value.length === 0) {
    return value;
  }

  return [value[0]?.toLocaleUpperCase('en-US'), value.slice(1)].join('');
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function determineDutyType(
  contentTypeRowId: number,
  contentMemberTypeRowId: number | undefined,
  name: string,
  highEnd: boolean,
): string {
  switch (contentTypeRowId) {
    case 2:
      return 'dungeon';

    case 3:
      return 'guildhest';

    case 4:
      if (
        name.endsWith('(Extreme)') ||
        name.startsWith("The Minstrel's Ballad:") ||
        highEnd
      ) {
        return 'extreme-trial';
      }

      if (name.endsWith('(Unreal)')) {
        return 'unreal-trial';
      }

      return 'trial';

    case 5:
      if (contentMemberTypeRowId === 4) {
        return 'alliance-raid';
      }

      if (name.endsWith('(Savage)') || highEnd) {
        return 'savage-raid';
      }

      return 'raid';

    case 6:
      return 'pvp';

    case 7:
      return 'quest-battle';

    case 21:
      return 'deep-dungeon';

    case 26:
      return 'alliance-raid';

    case 28:
      return 'ultimate-raid';

    case 29:
      return 'variant-dungeon';

    case 30:
      return name.endsWith('(Savage)') || highEnd
        ? 'criterion-savage'
        : 'criterion-dungeon';

    case 31:
      return 'criterion-savage';

    default:
      return 'duty';
  }
}

function getCachePath(version: string, schema: string, rowId: number): string {
  return path.join(
    xivapiCacheRoot,
    'content-finder-condition',
    createSafePathSegment(version),
    createSafePathSegment(schema),
    `row-${rowId}.json`,
  );
}

function parseDutyRow(rowId: number, fields: JsonObject): CachedDuty {
  const rawName = readString(fields.Name);

  const contentRowId = readInteger(fields['Content@as(raw)']);

  const contentLinkType = readInteger(fields.ContentLinkType);

  const contentTypeRowId = readInteger(fields['ContentType@as(raw)']);

  const contentMemberTypeRowId = readInteger(
    fields['ContentMemberType@as(raw)'],
  );

  const contentType = asObject(fields.ContentType);

  const contentTypeFields = asObject(contentType?.fields);

  const contentTypeName = readString(contentTypeFields?.Name);

  if (!rawName) {
    throw new Error(`ContentFinderCondition row ${rowId} has no name.`);
  }

  if (!contentRowId || contentRowId <= 0) {
    throw new Error(`ContentFinderCondition row ${rowId} has no content row.`);
  }

  if (contentLinkType !== 1) {
    throw new Error(
      [
        `ContentFinderCondition row ${rowId}`,
        `uses unsupported ContentLinkType ${String(contentLinkType)}.`,
      ].join(' '),
    );
  }

  if (!contentTypeRowId || contentTypeRowId <= 0) {
    throw new Error(`ContentFinderCondition row ${rowId} has no content type.`);
  }

  const name = capitalizeName(rawName);

  const highEnd = readBoolean(fields.HighEndDuty) ?? false;

  const level = readInteger(fields.ClassJobLevelRequired) ?? 1;

  const minimumItemLevel = readInteger(fields.ItemLevelRequired) ?? 0;

  const levelSync = readInteger(fields.ClassJobLevelSync) ?? 0;

  const itemLevelSync = readInteger(fields.ItemLevelSync) ?? 0;

  const queueMaxPlayers = readInteger(fields.QueueMaxPlayers) ?? 0;

  const partySize =
    queueMaxPlayers > 0
      ? queueMaxPlayers
      : contentMemberTypeRowId !== undefined
        ? CONTENT_MEMBER_PARTY_SIZES.get(contentMemberTypeRowId)
        : undefined;

  return cachedDutySchema.parse({
    contentFinderConditionRowId: rowId,
    contentRowId,

    id: `duty-${rowId}`,
    name,

    type: determineDutyType(
      contentTypeRowId,
      contentMemberTypeRowId,
      name,
      highEnd,
    ),

    level,

    minimumItemLevel: minimumItemLevel > 0 ? minimumItemLevel : undefined,

    levelSync: levelSync > 0 ? levelSync : undefined,

    itemLevelSync: itemLevelSync > 0 ? itemLevelSync : undefined,

    partySize,

    highEnd,

    /*
     * Keep this read in place while resolving future duty types.
     * It gives us a useful fallback when ContentType gains a row
     * that is not yet included in determineDutyType().
     */
    ...(contentTypeName &&
    determineDutyType(
      contentTypeRowId,
      contentMemberTypeRowId,
      name,
      highEnd,
    ) === 'duty'
      ? {
          type: slugify(contentTypeName),
        }
      : {}),
  });
}

async function readCachedDuty(
  cachePath: string,
): Promise<CachedDuty | undefined> {
  try {
    return cachedDutySchema.parse(await readJsonFile(cachePath));
  } catch (error) {
    const errorCode =
      error instanceof Error && 'code' in error
        ? String(error.code)
        : undefined;

    if (errorCode === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
}

function chunkValues<T>(values: readonly T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }

  return chunks;
}

async function fetchMissingDuties(
  rowIds: readonly number[],
  version: string,
  schema: string,
): Promise<Map<number, CachedDuty>> {
  const dutiesByRowId = new Map<number, CachedDuty>();

  async function fetchChunk(chunk: readonly number[]): Promise<void> {
    if (chunk.length === 0) {
      return;
    }

    try {
      const response = await requestXivapi({
        path: '/sheet/ContentFinderCondition',

        query: {
          rows: chunk.join(','),
          fields: CONTENT_FINDER_FIELDS,

          language: 'en',

          version,
          schema,
        },

        responseSchema: xivapiSheetResponseSchema,
      });

      for (const row of response.rows) {
        const duty = parseDutyRow(row.row_id, row.fields as JsonObject);

        dutiesByRowId.set(row.row_id, duty);

        await writeJsonFile(getCachePath(version, schema, row.row_id), duty);
      }
    } catch (error) {
      const isMissingRowError =
        error instanceof XivapiRequestError && error.status === 404;

      if (!isMissingRowError) {
        throw error;
      }

      /*
       * XIVAPI rejects the entire batch when one requested row
       * does not exist. Split the batch until the invalid script
       * reference is isolated.
       */
      if (chunk.length > 1) {
        const middleIndex = Math.floor(chunk.length / 2);

        await fetchChunk(chunk.slice(0, middleIndex));

        await delayBetweenRequests();

        await fetchChunk(chunk.slice(middleIndex));

        return;
      }

      const missingRowId = chunk[0];

      console.warn(
        [
          'Skipping QuestParams duty reference',
          String(missingRowId),
          'because it is not a',
          'ContentFinderCondition row.',
        ].join(' '),
      );
    }
  }

  const chunks = chunkValues(rowIds, 100);

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex];

    if (!chunk) {
      continue;
    }

    await fetchChunk(chunk);

    if (chunkIndex < chunks.length - 1) {
      await delayBetweenRequests();
    }
  }

  return dutiesByRowId;
}

export async function resolveQuestDutyReferences(
  references: readonly InterpretedQuestDutyReference[],
  options: ResolveQuestDutyOptions = {},
): Promise<ResolvedQuestDuty[]> {
  const referencesByRowId = new Map<number, InterpretedQuestDutyReference>();

  for (const reference of references) {
    const existingReference = referencesByRowId.get(
      reference.contentFinderConditionRowId,
    );

    if (!existingReference || reference.relationship === 'unlocked') {
      referencesByRowId.set(reference.contentFinderConditionRowId, reference);
    }
  }

  if (referencesByRowId.size === 0) {
    return [];
  }

  const pins = await readXivapiPins();

  const dutiesByRowId = new Map<number, CachedDuty>();
  const missingRowIds: number[] = [];

  for (const rowId of referencesByRowId.keys()) {
    const cachedDuty = await readCachedDuty(
      getCachePath(pins.version, pins.schema, rowId),
    );

    if (cachedDuty) {
      dutiesByRowId.set(rowId, cachedDuty);
    } else {
      missingRowIds.push(rowId);
    }
  }

  if (missingRowIds.length > 0) {
    if (options.offline) {
      throw new Error(
        [
          'Offline duty resolution is missing cached rows:',
          missingRowIds.join(', '),
        ].join(' '),
      );
    }

    const fetchedDuties = await fetchMissingDuties(
      missingRowIds,
      pins.version,
      pins.schema,
    );

    for (const [rowId, duty] of fetchedDuties) {
      dutiesByRowId.set(rowId, duty);
    }
  }

  const resolvedDuties: ResolvedQuestDuty[] = [];

  for (const reference of referencesByRowId.values()) {
    const duty = dutiesByRowId.get(reference.contentFinderConditionRowId);

    /*
     * INSTANCEDUNGEON script parameters can also identify
     * solo quest instances that have no Duty Finder row.
     */
    if (!duty) {
      continue;
    }

    resolvedDuties.push({
      ...duty,
      relationship: reference.relationship,
    });
  }

  return resolvedDuties;
}
