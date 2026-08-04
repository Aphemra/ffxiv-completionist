import * as z from 'zod';

export const xivapiFieldsSchema = z.record(z.string(), z.unknown());

export const xivapiRowSchema = z
  .object({
    row_id: z.number().int().min(0),

    fields: xivapiFieldsSchema,

    transient: xivapiFieldsSchema.optional(),
  })
  .passthrough();

export const xivapiSheetResponseSchema = z
  .object({
    schema: z.string().min(1),
    version: z.string().min(1),

    rows: z.array(xivapiRowSchema),
  })
  .passthrough();

export const xivapiRowResponseSchema = z
  .object({
    schema: z.string().min(1),
    version: z.string().min(1),

    row_id: z.number().int().min(0),

    fields: xivapiFieldsSchema,

    transient: xivapiFieldsSchema.optional(),
  })
  .passthrough();

export const xivapiPinsSchema = z.strictObject({
  version: z.string().min(1),
  schema: z.string().min(1),
  capturedAt: z.string().min(1),
});

export type XivapiRow = z.infer<typeof xivapiRowSchema>;

export type XivapiSheetResponse = z.infer<typeof xivapiSheetResponseSchema>;

export type XivapiPins = z.infer<typeof xivapiPinsSchema>;
