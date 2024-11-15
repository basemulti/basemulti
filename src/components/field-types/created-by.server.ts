import { ExportValueParams } from "./types";

export const key = 'creator';

export function exportValue({
  tableName, fieldName, label, value, fieldSchema, data
}: ExportValueParams) {
  return data?.creator?.name ?? '';
}