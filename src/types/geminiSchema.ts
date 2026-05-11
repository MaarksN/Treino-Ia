export const Type = {
  ARRAY: 'ARRAY',
  BOOLEAN: 'BOOLEAN',
  INTEGER: 'INTEGER',
  NUMBER: 'NUMBER',
  OBJECT: 'OBJECT',
  STRING: 'STRING',
} as const;

export type GeminiSchemaType = typeof Type[keyof typeof Type];

export interface Schema {
  type: GeminiSchemaType;
  description?: string;
  enum?: string[];
  items?: Schema;
  nullable?: boolean;
  properties?: Record<string, Schema>;
  required?: string[];
}
