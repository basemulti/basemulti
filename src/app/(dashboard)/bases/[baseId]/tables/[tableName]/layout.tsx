import { cache, Suspense } from "react";
import SchemaServer from "@/lib/schema-server";

const getSchema = cache(SchemaServer.load);

export async function generateMetadata({ params }: any) {
  const { baseId } = params;
  let tableName = decodeURIComponent(params.tableName);
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      title: '404'
    }
  }

  const tableSchema = schema.getTableSchema(tableName);

  return {
    title: `${tableSchema.label} | ${schema?.schema?.label}`
  };
}

export default function Layout({ children }: {
  children: JSX.Element
}) {
  return children
}