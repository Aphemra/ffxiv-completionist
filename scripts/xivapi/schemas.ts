import * as z from 'zod';

export const xivapiFieldsSchema = z.record(z.string(), z.unknown());

export const xivapiRowSchema = z.looseObject({
  row_id: z.number().int().min(0),

  fields: xivapiFieldsSchema,

  transient: xivapiFieldsSchema.optional(),
});

export const xivapiSheetResponseSchema = z.looseObject({
  schema: z.string().min(1),
  version: z.string().min(1),

  rows: z.array(xivapiRowSchema),
});

export const xivapiRowResponseSchema = z.looseObject({
  schema: z.string().min(1),
  version: z.string().min(1),

  row_id: z.number().int().min(0),

  fields: xivapiFieldsSchema,

  transient: xivapiFieldsSchema.optional(),
});

export const xivapiPinsSchema = z.strictObject({
  version: z.string().min(1),
  schema: z.string().min(1),
  capturedAt: z.string().min(1),
});

export type XivapiRow = z.infer<typeof xivapiRowSchema>;

export type XivapiSheetResponse = z.infer<typeof xivapiSheetResponseSchema>;

export type XivapiPins = z.infer<typeof xivapiPinsSchema>;
