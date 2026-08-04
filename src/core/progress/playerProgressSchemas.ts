import * as z from 'zod';

const contentIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Content IDs must use lowercase kebab-case.',
  );

export const playerProgressSchema = z.strictObject({
  schemaVersion: z.literal(1),

  profileId: z.string().trim().min(1).max(120),
  characterName: z.string().trim().max(80),
  dataCenter: z.string().trim().max(80),
  world: z.string().trim().max(80),

  completedQuestIds: z.array(contentIdSchema),
  currentQuestId: contentIdSchema.nullable(),
  bookmarkedQuestIds: z.array(contentIdSchema),

  questNotes: z.record(
    contentIdSchema,
    z.string().max(5000),
  ),

  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const persistedProgressStateSchema = z.strictObject({
  profile: playerProgressSchema,
});

export type PlayerProgress = z.infer<typeof playerProgressSchema>;

export type ProfileMetadata = Pick<
  PlayerProgress,
  'characterName' | 'dataCenter' | 'world'
>;