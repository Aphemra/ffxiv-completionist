type JsonObject = Record<string, unknown>;

import { getCuratedQuestUnlocks } from './questUnlockCatalog';

export interface InterpretedQuestUnlock {
  type: string;

  targetId: string;
  sourceRowId: number;

  name: string;
  notes?: string;
}

export interface InterpretedQuestDutyReference {
  instanceContentRowId: number;
  sourceInstruction: string;
  relationship: 'required' | 'unlocked';
}

function asObject(value: unknown): JsonObject | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as JsonObject;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

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

function relationFields(value: unknown): JsonObject | undefined {
  return asObject(asObject(value)?.fields);
}

function relationRowId(value: unknown): number | undefined {
  const relation = asObject(value);

  const rowId = readInteger(relation?.row_id) ?? readInteger(relation?.value);

  return rowId !== undefined && rowId > 0 ? rowId : undefined;
}

function relationName(
  value: unknown,
  fieldNames: readonly string[],
): string | undefined {
  const fields = relationFields(value);

  for (const fieldName of fieldNames) {
    const name = readString(fields?.[fieldName]);

    if (name) {
      return name;
    }
  }

  return undefined;
}

function toGameDataId(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'unknown';
}

function createRelationUnlock(
  value: unknown,
  options: {
    type: string;
    idPrefix: string;
    nameFields: readonly string[];
  },
): InterpretedQuestUnlock | undefined {
  const sourceRowId = relationRowId(value);

  const name = relationName(value, options.nameFields);

  if (sourceRowId === undefined || !name) {
    return undefined;
  }

  return {
    type: options.type,

    targetId: `${options.idPrefix}-${sourceRowId}`,
    sourceRowId,

    name,
  };
}

function createDutyUnlock(value: unknown): InterpretedQuestUnlock | undefined {
  const instanceContentRowId = relationRowId(value);

  const instanceContentFields = relationFields(value);

  const contentFinderCondition = instanceContentFields?.ContentFinderCondition;

  const contentFinderConditionRowId = relationRowId(contentFinderCondition);

  const dutyName = relationName(contentFinderCondition, ['Name']);

  if (instanceContentRowId === undefined || !dutyName) {
    return undefined;
  }

  const contentFinderFields = relationFields(contentFinderCondition);

  const contentTypeName = relationName(contentFinderFields?.ContentType, [
    'Name',
  ]);

  const sourceRowId = contentFinderConditionRowId ?? instanceContentRowId;

  return {
    type: toGameDataId(contentTypeName ?? 'duty'),

    targetId: `duty-${sourceRowId}`,
    sourceRowId,

    name: dutyName,

    notes:
      contentFinderConditionRowId !== undefined
        ? `Content Finder row ${contentFinderConditionRowId}.`
        : `Instance Content row ${instanceContentRowId}.`,
  };
}

const supportedCollectibleItemActionRowIds = new Set<number>([
  853, 1322, 2633, 3357, 20086, 25183, 37312, 29459,
]);

const chocoboBardingItemRowIds = new Set<number>([
  7550, // Egg Harness
  14081, // Egg Hunter Barding
  44496, // Starlight Stalls Barding
  10082, // Paramour Barding
  36013, // Postmoogle Barding
]);

export function isSupportedCollectibleReward(
  actionRowId: number,
  itemRowId: number,
): boolean {
  return (
    supportedCollectibleItemActionRowIds.has(actionRowId) ||
    (actionRowId === 1013 && chocoboBardingItemRowIds.has(itemRowId))
  );
}

function createCollectibleRewardUnlock(
  rawItem: unknown,
): InterpretedQuestUnlock | undefined {
  const itemRowId = relationRowId(rawItem);

  const itemFields = relationFields(rawItem);

  const itemName = relationName(rawItem, ['Name']);

  if (itemRowId === undefined || !itemFields || !itemName) {
    return undefined;
  }

  const itemActionFields = relationFields(itemFields.ItemAction);

  const actionRowId = relationRowId(itemActionFields?.Action);

  const dataRowId = asArray(itemActionFields?.Data)
    .map(readInteger)
    .find((rowId): rowId is number => rowId !== undefined && rowId > 0);

  const additionalDataRowId = relationRowId(itemFields.AdditionalData);

  const relatedRowId = dataRowId ?? additionalDataRowId;

  if (actionRowId === 1013 && chocoboBardingItemRowIds.has(itemRowId)) {
    return {
      type: 'chocobo-barding',
      targetId: `chocobo-barding-${itemRowId}`,
      sourceRowId: itemRowId,
      name: itemName,
      notes: `Obtaining ${itemName} adds this chocobo barding.`,
    };
  }

  if (relatedRowId === undefined) {
    return undefined;
  }

  let type: string;
  let targetId: string;
  let notes: string;

  switch (actionRowId) {
    case 1322:
      type = 'mount';
      targetId = `mount-${relatedRowId}`;
      notes = `Using ${itemName} unlocks this mount.`;
      break;

    case 853:
      type = 'minion';
      targetId = `minion-${relatedRowId}`;
      notes = `Using ${itemName} unlocks this minion.`;
      break;

    case 2633:
      type = 'emote';
      targetId = `emote-${relatedRowId}`;
      notes = `Using ${itemName} unlocks this emote.`;
      break;

    case 3357:
      type = 'triple-triad-card';
      targetId = `triple-triad-card-${relatedRowId}`;
      notes = `Using ${itemName} adds this Triple Triad card.`;
      break;

    case 25183:
      type = 'orchestrion-roll';
      targetId = `orchestrion-roll-${relatedRowId}`;
      notes = `Using ${itemName} adds this orchestrion roll.`;
      break;

    case 20086:
      type = 'fashion-accessory';
      targetId = `fashion-accessory-${relatedRowId}`;
      notes = `Using ${itemName} unlocks this fashion accessory.`;
      break;

    case 29459:
      type = 'framer-kit';
      targetId = `framer-kit-${itemRowId}`;
      notes = `Using ${itemName} unlocks this Framer's Kit.`;
      break;

    case 37312:
      type = 'facewear';
      targetId = `facewear-${relatedRowId}`;
      notes = `Using ${itemName} unlocks this facewear.`;
      break;

    default:
      return undefined;
  }

  return {
    type,
    targetId,
    sourceRowId: itemRowId,
    name: itemName,
    notes,
  };
}

export function interpretQuestUnlocks(
  rawFields: unknown,
  questRowId?: number,
): InterpretedQuestUnlock[] {
  const fields = asObject(rawFields);

  if (!fields) {
    return [];
  }

  const unlocks: InterpretedQuestUnlock[] = [];

  if (questRowId !== undefined) {
    for (const curatedUnlock of getCuratedQuestUnlocks(questRowId)) {
      unlocks.push({
        type: curatedUnlock.type,
        targetId: curatedUnlock.targetId,
        sourceRowId: questRowId,
        name: curatedUnlock.name,
        notes: curatedUnlock.notes,
      });
    }
  }

  const actionUnlock = createRelationUnlock(fields.ActionReward, {
    type: 'action',
    idPrefix: 'action',
    nameFields: ['Name'],
  });

  if (actionUnlock) {
    unlocks.push(actionUnlock);
  }

  const emoteUnlock = createRelationUnlock(fields.EmoteReward, {
    type: 'emote',
    idPrefix: 'emote',
    nameFields: ['Name'],
  });

  if (emoteUnlock) {
    unlocks.push(emoteUnlock);
  }

  for (const rawGeneralAction of asArray(fields.GeneralActionReward)) {
    const generalActionUnlock = createRelationUnlock(rawGeneralAction, {
      type: 'general-action',
      idPrefix: 'general-action',
      nameFields: ['Name'],
    });

    if (generalActionUnlock) {
      unlocks.push(generalActionUnlock);
    }
  }

  const classJobUnlock = createRelationUnlock(fields.ClassJobUnlock, {
    type: 'class-job',
    idPrefix: 'class-job',
    nameFields: ['NameEnglish', 'Name'],
  });

  if (classJobUnlock) {
    unlocks.push(classJobUnlock);
  }

  const dutyUnlock = createDutyUnlock(fields.InstanceContentUnlock);

  if (dutyUnlock) {
    unlocks.push(dutyUnlock);
  }

  for (const rawRewardItem of asArray(fields.Reward)) {
    const collectibleUnlock = createCollectibleRewardUnlock(rawRewardItem);

    if (collectibleUnlock) {
      unlocks.push(collectibleUnlock);
    }
  }

  const unlocksByKey = new Map<string, InterpretedQuestUnlock>();

  for (const unlock of unlocks) {
    const key = [unlock.type, unlock.targetId].join('|');

    unlocksByKey.set(key, unlock);
  }

  return Array.from(unlocksByKey.values());
}

export function interpretQuestDutyReferences(
  rawFields: JsonObject,
): InterpretedQuestDutyReference[] {
  const scriptParameters = asArray(rawFields.QuestParams)
    .map((rawParameter) => {
      const parameter = asObject(rawParameter);

      const sourceInstruction = readString(parameter?.ScriptInstruction);

      const argument = readInteger(parameter?.ScriptArg);

      if (!sourceInstruction || argument === undefined) {
        return undefined;
      }

      return {
        sourceInstruction,
        argument,
      };
    })
    .filter(
      (
        parameter,
      ): parameter is {
        sourceInstruction: string;
        argument: number;
      } => parameter !== undefined,
    );

  const unlocksContentFinder = scriptParameters.some(
    (parameter) =>
      parameter.sourceInstruction.toLocaleUpperCase('en-US') ===
      'UNLOCK_ADD_NEW_CONTENT_TO_CF',
  );

  const referencesByRowId = new Map<number, InterpretedQuestDutyReference>();

  for (const parameter of scriptParameters) {
    const normalizedInstruction =
      parameter.sourceInstruction.toLocaleUpperCase('en-US');

    if (
      !/^INSTANCEDUNGEON\d+$/.test(normalizedInstruction) ||
      parameter.argument <= 0
    ) {
      continue;
    }

    const existingReference = referencesByRowId.get(parameter.argument);

    const reference: InterpretedQuestDutyReference = {
      instanceContentRowId: parameter.argument,
      sourceInstruction: parameter.sourceInstruction,
      relationship: unlocksContentFinder ? 'unlocked' : 'required',
    };

    /*
     * Prefer an unlocked relationship if duplicate script parameters
     * reference the same ContentFinderCondition row.
     */
    if (!existingReference || reference.relationship === 'unlocked') {
      referencesByRowId.set(parameter.argument, reference);
    }
  }

  return Array.from(referencesByRowId.values());
}
