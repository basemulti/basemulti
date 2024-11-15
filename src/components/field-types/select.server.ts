import { ExportValueParams } from "./types";

export const key = 'select';

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
  if (value === null || value === undefined) {
    return '';
  }

  const uiWidget = fieldSchema?.ui;
  const enumIndex = uiWidget?.enum?.findIndex((option: { label: string, value: any }, index: number) => option.value == value);

  return uiWidget?.enum?.[enumIndex]?.label ?? value;
}