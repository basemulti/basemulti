"use client";

import SchemaBuilder from "@/lib/schema-builder";
import { FieldEditor } from "../field-types";

interface ModelFormProps {
  schema: SchemaBuilder;
  baseId: string,
  tableName: string,
  disabled?: boolean;
  submit?: Function;
  data: any;
}

export const ModelForm: React.FC<ModelFormProps> = ({
  schema,
  baseId,
  tableName,
  disabled,
  data,
}) => {
  const fieldsSchema = schema.getFields(tableName);

  return (
    <>
      {Object.entries(fieldsSchema).map(([name, fieldSchema]: any) => {
        return <FieldEditor
          key={name}
          name={name}
          type={fieldSchema.ui.type}
          schema={fieldSchema}
          disabled={disabled}
          baseId={baseId}
          tableName={tableName}
          originalData={data}
        />
      })}
      {/* <div>Dirty: {isDirty ? 'true' : 'false'} {JSON.stringify(watch(), null, 2)}</div> */}
    </>
  );
};