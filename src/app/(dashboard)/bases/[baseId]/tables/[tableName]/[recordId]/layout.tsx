import { ReactNode } from "react";
import React, { cache } from "react";
import { redirect } from "next/navigation";
import SchemaServer from "@/lib/schema-server";
import RecordBar from "@/components/record-bar";
import startCase from "lodash/startCase";

const getSchema = cache(SchemaServer.load);

export default async function Layout({ children, params }: {
  children: ReactNode;
  params: any;
}) {
  const { baseId, recordId } = params;
  let tableName = decodeURIComponent(params.tableName);
  const schema = await getSchema(baseId);
  if (!schema) {
    redirect(`/404`);
  }
  
  const tableSchema = schema.getTableSchema(tableName);

  const breadcrumbItems = [
    { title: tableSchema.label || startCase(tableSchema.name), link: `/bases/${baseId}/tables/${tableName}` },
    { title: `${tableSchema.label || startCase(tableSchema.name)}:${recordId}`, link: `/bases/${baseId}/tables/${tableName}/${recordId}` }
  ];
  
  return <div className="flex-1 size-full flex flex-col">
    <RecordBar breadcrumbItems={breadcrumbItems} />
    {children}
  </div>
}