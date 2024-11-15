import { ExportValueParams } from "./types";

export const key = 'modifier';

export function exportValue({
  tableName, fieldName, label, value, fieldSchema, data
}: ExportValueParams) {
  return data?.modifier?.name ?? '';
}