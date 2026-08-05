import type { InterpretedQuestDutyReference } from './interpretQuestUnlocks';
import { resolveQuestDutyReferences } from './questDutyResolver';

function readRowIds(): number[] {
  const optionIndex = process.argv.indexOf('--rows');

  const rawValue = optionIndex >= 0 ? process.argv[optionIndex + 1] : undefined;

  if (!rawValue) {
    throw new Error(
      [
        'ContentFinderCondition row IDs are required.',
        '',
        'Usage:',
        'npm run xivapi:inspect:duties -- --rows 2,4',
      ].join('\n'),
    );
  }

  const rowIds = rawValue.split(',').map((value) => Number(value.trim()));

  if (rowIds.some((rowId) => !Number.isInteger(rowId) || rowId <= 0)) {
    throw new Error(
      'Every ContentFinderCondition row ID must be a positive integer.',
    );
  }

  return Array.from(new Set(rowIds));
}

async function main(): Promise<void> {
  const references: InterpretedQuestDutyReference[] = readRowIds().map(
    (rowId) => ({
      contentFinderConditionRowId: rowId,
      sourceInstruction: 'manual-inspection',
      relationship: 'unlocked',
    }),
  );

  const duties = await resolveQuestDutyReferences(references);

  console.log(JSON.stringify(duties, null, 2));
}

await main();
