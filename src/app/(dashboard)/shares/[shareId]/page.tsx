import { cache } from "react";
import SchemaServer from "@/lib/schema-server";
import { redirect } from "next/navigation";
import Bar from "@/components/bar";
import TableIconSelector from "@/components/table-icon-selector";
import AppInitializer from "@/components/app-initializer";
import { getRole } from "@/lib/utils";
import View from "@/components/blocks/view";
import { getShare } from "@/lib/server";

export async function generateMetadata({ params }: any) {
  const { shareId } = params;
  
  const share = await getShare(shareId);
  if (!share) {
    return {
      title: '404'
    }
  }

  const tableName = share.table_name;
  const baseId = share.base_id;
  const viewId = share.view_id;
  const schema = await getSchema(baseId);

  if (!schema || !viewId || !schema.hasView(tableName, viewId)) {
    return {
      title: '404'
    }
  }

  return {
    title: schema.getView(tableName, viewId)?.label
  };
}

type PageProps = {
  params: {
    shareId: string
  },
  searchParams: Record<string, string | string[] | undefined>;
};

const getSchema = cache(SchemaServer.loadWithoutAuth);

export default async function Page({ params, searchParams }: PageProps) {
  const { shareId } = params;
  const share = await getShare(shareId);

  if (!share) {
    redirect('/404');
  }

  const tableName = share.table_name;
  const baseId = share.base_id;
  const viewId = share.view_id;

  const schema = await getSchema(baseId);

  if (!schema) {
    redirect('/404');
  }

  if (schema.hasTable(tableName) === false) {
    redirect('/404');
  }

  const tableSchema = schema.getTableSchema(tableName);

  if (!viewId || !schema.hasView(tableName, viewId)) {
    redirect('/404');
  }

  const safeSchema = schema.safe();
  safeSchema.tables = {
    [tableName]: safeSchema.tables[tableName]
  }

  return (
    <>
      <AppInitializer
        schema={safeSchema}
        user={null}
        base={{
          id: baseId,
          workspace_id: schema.schema.workspace_id as string,
          label: schema.schema.label as string,
          role: getRole('no-access'),
          created_at: schema.schema.created_at as string,
          updated_at: schema.schema.updated_at as string,
        }}
      >
        <div className="flex-1 flex flex-col size-full h-screen">
          <Bar>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-md w-6 h-6 overflow-hidden">
                  <img src="/logo.svg" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-base font-semibold tracking-tight">Basemulti</h2>
                </div>
              </div>
              <TableIconSelector baseId={baseId} tableName={tableName} />
              <h1 className="text-base font-bold">
                {tableSchema?.label || tableName}
              </h1>
            </div>
          </Bar>
          <View
            schema={schema}
            params={params}
            searchParams={searchParams}
            tableSchema={tableSchema}
            tableName={tableName}
            viewId={viewId}
            isSharingPage={true}
          />
        </div>
      </AppInitializer>
    </>
  );
}
