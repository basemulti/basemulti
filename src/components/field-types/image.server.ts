export const key = 'image';

export function createField({
  table, fieldName, value
}: {
  table: any;
  fieldName: string;
  value: any;
}) {
  table.string(fieldName);
}