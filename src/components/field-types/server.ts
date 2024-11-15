import * as StringField from './string.server';
import * as NumberField from './number.server';
import * as SwitchField from './switch.server';
import * as DateField from './date.server';
import * as DatetimeField from './datetime.server';
import * as SelectField from './select.server';
import * as MultiSelectField from './multi-select.server';
import * as TextareaField from './textarea.server';
import * as MarkdownField from './markdown.server';
import * as ImageField from './image.server';
import * as EmailField from './email.server';
import * as LinkField from './url.server';
import * as RelationField from './relation.server';
import * as CreatedAtField from './created-at.server';
import * as UpdatedAtField from './updated-at.server';
import * as CreatedByField from './created-by.server';
import * as UpdatedByField from './updated-by.server';
import { ExportValueParams, FieldActionsType } from "./types";

export const fieldTypes: Record<string, FieldActionsType> = {};

const defaultFieldType = StringField;

export function registerFieldTypeActions(customField: FieldActionsType) {
  fieldTypes[customField.key] = customField;
}

export function onCreateField(type: string, args: any) {
  const fieldType = fieldTypes[type];

  if (fieldType?.createField) {
    return fieldType.createField(args);
  } else {
    return defaultFieldType.createField(args);
  }
}

export function getExportValue(type: string, args: ExportValueParams) {
  const fieldType = fieldTypes[type];

  if (fieldType?.exportValue) {
    return fieldType.exportValue(args);
  } else {
    return defaultFieldType.exportValue(args);
  }
}

registerFieldTypeActions(StringField);
registerFieldTypeActions(NumberField);
registerFieldTypeActions(SwitchField);
registerFieldTypeActions(DateField);
registerFieldTypeActions(DatetimeField);
registerFieldTypeActions(SelectField);
registerFieldTypeActions(MultiSelectField);
registerFieldTypeActions(TextareaField);
registerFieldTypeActions(MarkdownField);
registerFieldTypeActions(ImageField);
registerFieldTypeActions(EmailField);
registerFieldTypeActions(LinkField);
registerFieldTypeActions(RelationField);
registerFieldTypeActions(CreatedAtField);
registerFieldTypeActions(UpdatedAtField);
registerFieldTypeActions(CreatedByField);
registerFieldTypeActions(UpdatedByField);