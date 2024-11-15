import { ExportValueParams } from "./types";

export const key = 'relation';

export function exportValue({
  tableName, fieldName, value, fieldSchema, data
}: ExportValueParams) {
  const uiWidget = fieldSchema?.ui;
  return data?.[uiWidget.name]?.[uiWidget.label_field || 'id'] ?? '';
}