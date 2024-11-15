import dayjs from "dayjs";
import { ExportValueParams } from "./types";

export const key = 'datetime';

export function createField({
  table, fieldName, value
}: {
  table: any;
  fieldName: string;
  value: any;
}) {
  table.datetime(fieldName);
}

export function exportValue({
  tableName, fieldName, label, value, fieldSchema
}: ExportValueParams) {
  let date = dayjs(value);
  const uiWidget = fieldSchema?.ui;

  if (uiWidget?.timezone) {
    date = date.tz(uiWidget.timezone);
  }
  
  return date.format(uiWidget?.format || 'YYYY-MM-DD');
}