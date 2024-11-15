import { allows, denies, cn, formatWithCommas } from "@/lib/utils";
import startCase from "lodash/startCase";
import { cache, Suspense } from "react";
import ViewList from "@/components/blocks/view/view-list";
import SchemaServer from "@/lib/schema-server";
import Error from "@/components/error";
import { createView } from "@/actions/view";
import EnhancedError from "@/components/enhanced-error";
import { redirect } from "next/navigation";
import TableBar from "@/components/table-bar";
import View from "@/components/blocks/view";

type PageProps = {
  params: {
    baseId: string
    tableName: string
  },
  searchParams: Record<string, string | string[] | undefined>;
};

const getSchema = cache(SchemaServer.load);

export default async function Page({ params, searchParams }: PageProps) {
  const { baseId } = params;
  const schema = await getSchema(baseId);
  let tableName = decodeURIComponent(params.tableName);

  if (!schema) {
    redirect('/404');
  }

  if (schema.hasTable(tableName) === false) {
    return <div className="relative size-full">
      <Error
        code={404}
        title={`Table "${tableName}" not found`}
        description="Sorry, the page you are looking for doesn't exist or has been moved."
      />
    </div>
  }

  const tableSchema = schema.getTableSchema(tableName);
  const tabs = schema.table(tableName).tabs();

  if (tabs.length === 0) {
    const result = await createView({ baseId: baseId, tableName: tableName, label: 'All' });
    if (result.error) {
      return <div className="relative size-full">
        <Error
          code={500}
          title={result.error}
          description="Sorry, the page you are looking for doesn't exist or has been moved."
        />
      </div>;
    } else if (result.view) {
      tabs.push(result.view)
    }
  }

  const breadcrumbItems = [
    { title: schema.get().label || baseId, link: `/bases/${baseId}` },
    { title: tableSchema?.label || startCase(tableName), link: `/bases/${baseId}/tables/${tableName}`, list: tabs },
  ];

  const viewId = (searchParams.tab ?? schema.getDefaultViewId(tableName)) as string;

  return (
    <>
      <div className="flex-1 size-full flex flex-col">
        <TableBar
          viewId={viewId}
          breadcrumbItems={breadcrumbItems}
          settingsDisabled={denies(schema?.schema?.role, 'table:update')}
          settingsLink={`/bases/${baseId}/tables/${tableName}/settings/field`}
        />
        <ViewList
          tabs={tabs}
        />
        <View
          schema={schema}
          params={params}
          searchParams={searchParams}
          tableSchema={tableSchema}
          tableName={tableName}
          viewId={viewId}
          isSharingPage={false}
        />
      </div>
    </>
  );
}
