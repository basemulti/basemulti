import * as StringField from './string';
import * as NumberField from './number';
import * as SwitchField from './switch';
import * as DateField from './date';
import * as DatetimeField from './datetime';
import * as SelectField from './select';
import * as MultiSelectField from './multi-select';
import * as TextareaField from './textarea';
import * as MarkdownField from './markdown';
import * as ImageField from './image';
import * as EmailField from './email';
import * as LinkField from './url';
import * as RelationField from './relation';
import * as CreatedByField from './created-by';
import * as UpdatedByField from './updated-by';
import * as CreatedAtField from './created-at';
import * as UpdatedAtField from './updated-at';
import { useWatch } from 'react-hook-form';
import { FieldType } from './types';
import { cn, getDefaultUItype } from '@/lib/utils';

export const fieldTypes: Record<string, FieldType> = {};

const defaultFieldType = StringField;

export function registerFieldType(customField: FieldType) {
  fieldTypes[customField.key] = customField;
}

export function getFieldType(key: string) {
  return fieldTypes[key] ?? defaultFieldType;
}

export function FieldValue({ type, ...props }: any) {
  const fieldType = fieldTypes[type];

  if (fieldType?.Value) {
    return <fieldType.Value {...props} />;
  } else {
    return <defaultFieldType.Value {...props} />;
  }
}

export function FieldEditor({ type, ...props }: any) {
  const fieldType = fieldTypes[type];

  if (fieldType?.Editor) {
    return <fieldType.Editor {...props} />;
  } else {
    return <defaultFieldType.Editor type={type} {...props} />;
  }
}

type FieldIconProps = {
  type: string;
  className?: string;
}

export function FieldIcon({ type, className: classNameProps }: FieldIconProps) {
  const className = cn("w-[14px] h-[14px]", classNameProps);
  const fieldType = fieldTypes[type];

  if (fieldType?.Icon) {
    return <fieldType.Icon className={className} />;
  }

  const defaultUItype = fieldTypes[getDefaultUItype(type)];
  if (defaultUItype?.Icon) {
    return <defaultUItype.Icon className={className} />;
  }
  
  return <defaultFieldType.Value className={className} />;
}

export function FieldTypeEditor(props: any) {
  const uiWidget = useWatch({ name: 'ui' });
  const fieldType = fieldTypes[uiWidget.type];

  if (fieldType?.TypeEditor) {
    return <fieldType.TypeEditor {...props} />;
  } else {
    return <defaultFieldType.TypeEditor {...props} />;
  }
}

export function FieldFilterOperator({ type, ...props }: any) {
  const fieldType = fieldTypes[type];

  if (fieldType?.FilterOperator) {
    return <fieldType.FilterOperator {...props} />;
  } else {
    return <defaultFieldType.FilterOperator {...props} />;
  }
}

registerFieldType(StringField);
registerFieldType(TextareaField);
registerFieldType(NumberField);
registerFieldType(EmailField);
registerFieldType(LinkField);
registerFieldType(SelectField);
registerFieldType(MultiSelectField);
registerFieldType(DateField);
registerFieldType(DatetimeField);
registerFieldType(MarkdownField);
registerFieldType(SwitchField);
registerFieldType(ImageField);
registerFieldType(RelationField);
registerFieldType(CreatedByField);
registerFieldType(UpdatedByField);
registerFieldType(CreatedAtField);
registerFieldType(UpdatedAtField);
