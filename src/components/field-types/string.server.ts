import { ExportValueParams } from "./types";

export const key = 'string';

export function createField({
  table, fieldName, value
}: {
  table: any;
  fieldName: string;
  value: any;
}) {
  table.string(fieldName);
}

export function exportValue({
  tableName, fieldName, label, value, fieldSchema
}: ExportValueParams) {
  return String(value);
}