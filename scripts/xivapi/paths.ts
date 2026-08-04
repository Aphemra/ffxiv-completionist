import { mkdir, readFile, writeFile } from 'node:fs/promises';

import path from 'node:path';

import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);

const currentDirectory = path.dirname(currentFilePath);

export const projectRoot = path.resolve(currentDirectory, '../..');

export const xivapiRoot = path.join(projectRoot, 'scripts', 'xivapi');

export const xivapiCacheRoot = path.join(xivapiRoot, '.cache');

export const xivapiPinsPath = path.join(xivapiRoot, 'pins.json');

export const questIndexPath = path.join(xivapiCacheRoot, 'quest-index.json');

export async function ensureDirectory(directoryPath: string): Promise<void> {
  await mkdir(directoryPath, {
    recursive: true,
  });
}

export async function writeJsonFile(
  filePath: string,
  value: unknown,
): Promise<void> {
  await ensureDirectory(path.dirname(filePath));

  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function readJsonFile(filePath: string): Promise<unknown> {
  const rawText = await readFile(filePath, 'utf8');

  return JSON.parse(rawText) as unknown;
}

export function createSafePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '_');
}
