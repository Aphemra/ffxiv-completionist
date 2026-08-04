import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';

import { spawn } from 'node:child_process';

import path from 'node:path';

import * as z from 'zod';

import { questCollectionFileSchema } from '../../src/modules/quests/data/questCollectionFileSchemas';

import {
  questManifestEntrySchema,
  questManifestSchema,
  type QuestManifestEntry,
} from '../../src/modules/quests/data/questSchemas';

import { projectRoot } from './paths';

type JsonObject = Record<string, unknown>;

const QUEST_MANIFEST_PATH = path.resolve(
  projectRoot,
  'public',
  'data',
  'quests',
  'manifest.json',
);

const PUBLIC_ROOT = path.resolve(projectRoot, 'public');

const stagingBundleSchema = z
  .object({
    generatedAt: z.string().min(1),

    sourceDefinition: z.string().min(1),

    manifestEntry: questManifestEntrySchema,

    collectionFile: questCollectionFileSchema,
  })
  .passthrough();

function readOption(optionName: string): string | undefined {
  const optionIndex = process.argv.indexOf(optionName);

  if (optionIndex < 0) {
    return undefined;
  }

  const value = process.argv[optionIndex + 1];

  if (value === undefined || value.startsWith('--')) {
    throw new Error(`Option "${optionName}" requires a value.`);
  }

  return value;
}

function hasFlag(flagName: string): boolean {
  return process.argv.includes(flagName);
}

function resolveProjectPath(inputPath: string): string {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(projectRoot, inputPath);
}

function readBundlePath(): string {
  const rawPath = readOption('--bundle');

  if (!rawPath) {
    throw new Error(
      [
        'A staging bundle is required.',
        '',
        'Usage:',
        'npm run xivapi:promote:collection -- --bundle scripts/xivapi/.cache/staging/example/example.bundle.json',
      ].join('\n'),
    );
  }

  return resolveProjectPath(rawPath);
}

function resolveCollectionPath(publicDataPath: string): string {
  const normalizedPath = publicDataPath.replace(/\\/g, '/');

  if (!normalizedPath.startsWith('data/quests/')) {
    throw new Error(
      [
        'Quest collection paths must be inside:',
        'public/data/quests/',
        '',
        `Received: ${publicDataPath}`,
      ].join('\n'),
    );
  }

  if (!normalizedPath.endsWith('.json')) {
    throw new Error(
      `Quest collection paths must end in ".json": ${publicDataPath}`,
    );
  }

  const resolvedPath = path.resolve(PUBLIC_ROOT, normalizedPath);

  const expectedPrefix = `${PUBLIC_ROOT}${path.sep}`;

  if (!resolvedPath.startsWith(expectedPrefix)) {
    throw new Error(
      [
        'The quest collection path resolves outside public/.',
        `Received: ${publicDataPath}`,
        `Resolved: ${resolvedPath}`,
      ].join('\n'),
    );
  }

  return resolvedPath;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

async function readOptionalFile(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), {
    recursive: true,
  });

  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function runNpmScript(
  scriptName: string,
  argumentsList: readonly string[] = [],
): Promise<void> {
  const npmEntryPoint = process.env.npm_execpath;

  if (!npmEntryPoint) {
    throw new Error(
      [
        'The npm entry point could not be determined.',
        '',
        'Launch this command through npm:',
        'npm run xivapi:promote:collection -- --bundle <path>',
      ].join('\n'),
    );
  }

  const commandArguments = [npmEntryPoint, 'run', scriptName];

  if (argumentsList.length > 0) {
    commandArguments.push('--', ...argumentsList);
  }

  await new Promise<void>((resolve, reject) => {
    const childProcess = spawn(process.execPath, commandArguments, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: process.env,
    });

    childProcess.once('error', (error) => {
      reject(
        new Error(
          [`Failed to launch npm script "${scriptName}".`, error.message].join(
            '\n',
          ),
          {
            cause: error,
          },
        ),
      );
    });

    childProcess.once('exit', (exitCode, signal) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          [
            `npm script "${scriptName}" failed.`,
            `Exit code: ${String(exitCode)}`,
            `Signal: ${signal ?? 'none'}`,
          ].join('\n'),
        ),
      );
    });
  });
}

function findCollectionById(
  collections: readonly QuestManifestEntry[],
  collectionId: string,
): number {
  return collections.findIndex((collection) => collection.id === collectionId);
}

function findCollectionByPath(
  collections: readonly QuestManifestEntry[],
  collectionPath: string,
): number {
  return collections.findIndex(
    (collection) => collection.path === collectionPath,
  );
}

function createNextManifest(
  currentManifest: z.infer<typeof questManifestSchema>,
  manifestEntry: QuestManifestEntry,
  datasetVersion: string | undefined,
): z.infer<typeof questManifestSchema> {
  const collections = [...currentManifest.collections];

  const existingIndex = findCollectionById(collections, manifestEntry.id);

  if (existingIndex >= 0) {
    collections[existingIndex] = manifestEntry;
  } else {
    collections.push(manifestEntry);
  }

  collections.sort((left, right) => {
    const sortDifference = left.sortOrder - right.sortOrder;

    if (sortDifference !== 0) {
      return sortDifference;
    }

    return left.id.localeCompare(right.id);
  });

  const nextManifest: JsonObject = {
    ...currentManifest,
    collections,
  };

  if (datasetVersion !== undefined) {
    nextManifest.datasetVersion = datasetVersion;
  }

  return questManifestSchema.parse(nextManifest);
}

function printPromotionSummary(
  bundlePath: string,
  destinationPath: string,
  manifestEntry: QuestManifestEntry,
  replacingExistingEntry: boolean,
  replacingExistingFile: boolean,
  datasetVersion: string,
  dryRun: boolean,
): void {
  console.log('');
  console.log(dryRun ? 'Promotion dry run' : 'Promoting quest collection');

  console.log('');
  console.log(`Collection: ${manifestEntry.title}`);

  console.log(`Collection ID: ${manifestEntry.id}`);

  console.log(`Category: ${manifestEntry.category}`);

  console.log(`Expansion: ${manifestEntry.expansionId}`);

  console.log(`Patch: ${manifestEntry.patch}`);

  console.log(`Verification: ${manifestEntry.verificationStatus}`);

  console.log(`Dataset version: ${datasetVersion}`);

  console.log('');
  console.log(`Bundle: ${bundlePath}`);

  console.log(`Destination: ${destinationPath}`);

  console.log(
    [
      'Manifest action:',
      replacingExistingEntry ? 'replace existing entry' : 'add new entry',
    ].join(' '),
  );

  console.log(
    [
      'Collection-file action:',
      replacingExistingFile ? 'replace existing file' : 'create new file',
    ].join(' '),
  );

  console.log('');
}

async function restoreFiles(
  manifestBackup: string,
  collectionBackup: string | undefined,
  collectionPath: string,
): Promise<void> {
  await writeFile(QUEST_MANIFEST_PATH, manifestBackup, 'utf8');

  if (collectionBackup !== undefined) {
    await mkdir(path.dirname(collectionPath), {
      recursive: true,
    });

    await writeFile(collectionPath, collectionBackup, 'utf8');

    return;
  }

  await rm(collectionPath, {
    force: true,
  });
}

async function main(): Promise<void> {
  const bundlePath = readBundlePath();

  const replaceExisting = hasFlag('--replace');

  const dryRun = hasFlag('--dry-run');

  const datasetVersion = readOption('--dataset-version');

  const bundleText = await readFile(bundlePath, 'utf8');

  const bundle = stagingBundleSchema.parse(JSON.parse(bundleText) as unknown);

  const manifestEntry = bundle.manifestEntry;

  const destinationPath = resolveCollectionPath(manifestEntry.path);

  const manifestText = await readFile(QUEST_MANIFEST_PATH, 'utf8');

  const currentManifest = questManifestSchema.parse(
    JSON.parse(manifestText) as unknown,
  );

  const existingIdIndex = findCollectionById(
    currentManifest.collections,
    manifestEntry.id,
  );

  const existingPathIndex = findCollectionByPath(
    currentManifest.collections,
    manifestEntry.path,
  );

  const replacingExistingEntry = existingIdIndex >= 0;

  const conflictingPathEntry =
    existingPathIndex >= 0 && existingPathIndex !== existingIdIndex;

  if (conflictingPathEntry) {
    const conflictingEntry = currentManifest.collections[existingPathIndex];

    throw new Error(
      [
        `Manifest path "${manifestEntry.path}" is already used`,
        `by collection "${conflictingEntry?.id ?? 'unknown'}".`,
        '',
        'Resolve the manifest-path conflict before promoting.',
      ].join('\n'),
    );
  }

  if (replacingExistingEntry && !replaceExisting) {
    throw new Error(
      [
        `Collection "${manifestEntry.id}" already exists in the manifest.`,
        '',
        'Review the staged changes, then rerun with:',
        '--replace',
      ].join('\n'),
    );
  }

  if (replacingExistingEntry) {
    const existingEntry = currentManifest.collections[existingIdIndex];

    if (existingEntry && existingEntry.path !== manifestEntry.path) {
      throw new Error(
        [
          `Collection "${manifestEntry.id}" changed paths.`,
          '',
          `Current: ${existingEntry.path}`,
          `Staged:  ${manifestEntry.path}`,
          '',
          'Path migrations must be handled manually so old files are not orphaned.',
        ].join('\n'),
      );
    }
  }

  const collectionBackup = await readOptionalFile(destinationPath);

  const replacingExistingFile = collectionBackup !== undefined;

  if (replacingExistingFile && !replaceExisting) {
    throw new Error(
      [
        `A collection file already exists at:`,
        destinationPath,
        '',
        'Review the staged changes, then rerun with:',
        '--replace',
      ].join('\n'),
    );
  }

  const nextManifest = createNextManifest(
    currentManifest,
    manifestEntry,
    datasetVersion,
  );

  printPromotionSummary(
    bundlePath,
    destinationPath,
    manifestEntry,
    replacingExistingEntry,
    replacingExistingFile,
    nextManifest.datasetVersion,
    dryRun,
  );

  if (dryRun) {
    console.log('Dry run complete. No files were changed.');

    return;
  }

  try {
    await writeJsonFile(destinationPath, bundle.collectionFile);

    await writeJsonFile(QUEST_MANIFEST_PATH, nextManifest);

    console.log('Files written. Validating the complete quest dataset...');

    console.log('');

    await runNpmScript('validate:data');
  } catch (error) {
    console.error('');
    console.error('Promotion failed. Restoring the previous files...');

    try {
      await restoreFiles(manifestText, collectionBackup, destinationPath);
    } catch (rollbackError) {
      throw new Error(
        [
          'Promotion failed and automatic rollback also failed.',
          '',
          `Manifest backup must be restored to:`,
          QUEST_MANIFEST_PATH,
          '',
          `Collection destination:`,
          destinationPath,
        ].join('\n'),
        {
          cause: {
            promotionError: error,
            rollbackError,
          },
        },
      );
    }

    throw new Error(
      [
        'Quest collection promotion failed.',
        'The previous manifest and collection files were restored.',
      ].join('\n'),
      {
        cause: error,
      },
    );
  }

  console.log('');
  console.log('Quest collection promoted successfully.');

  console.log('');
  console.log(`Manifest: ${QUEST_MANIFEST_PATH}`);

  console.log(`Collection: ${destinationPath}`);
}

await main();
