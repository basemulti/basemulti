export type TypeEditorProps = {
  baseId: string;
  tableName: string;
  name: string;
}

export type FieldType = {
  key: string;
  label: string;
  isSystemField?: boolean;
  Icon?: (props: any) => JSX.Element | null;
  Value?: (props: any) => JSX.Element | null;
  Editor?: (props: any) => JSX.Element | null;
  TypeEditor?: (props: any) => JSX.Element | null;
  FilterOperator?: (props: any) => JSX.Element | null;
}

export type FieldActionsType = {
  key: string;
  createField?: (args: any) => void;
  exportValue?: (args: any) => string;
}

export interface ExportValueParams {
  tableName: string;
  fieldName: string;
  label: string;
  value: any;
  fieldSchema: any;
  data: any;
}