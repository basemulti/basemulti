"use client";

import React from "react";
import { FieldFilterOperator } from "@/components/field-types";
import { useSchemaStore } from "@/store/base";

export default function FilterOperator(props: {
  filters: any[];
  setFilters: Function;
  params: any;
  index: number | string;
  tableName: string;
}) {
  const { tableName, params } = props;
  const schema = useSchemaStore(store => store.schema);
  const selectedColumn = schema?.getField(tableName, params[0]);

  return <FieldFilterOperator 
    type={selectedColumn?.ui?.type} 
    schema={selectedColumn}
    {...props} 
  />
}