import { ExportValueParams } from "./types";

export const key = 'switch';

export function createField({
  table, fieldName, value
}: {
  table: any;
  fieldName: string;
  value: any;
}) {
  table.tinyint(fieldName);
}

export function exportValue({
  tableName, fieldName, label, value, fieldSchema
}: ExportValueParams) {
  return value ? '✓' : '×';
}