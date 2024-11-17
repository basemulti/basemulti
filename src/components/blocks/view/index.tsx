'use server';

import SchemaServer from "@/lib/schema-server";
import EnhancedError from "@/components/enhanced-error";
import { GridView } from "@/components/blocks/view/grid-view";
import ModalDetail from "@/components/details/modal-detail";

async function Grid({ searchParams, schema, tableName, viewId, isSharingPage }: {
  searchParams: Record<string, string | string[] | undefined>;
  params: any;
  tableSchema: any;
  schema: SchemaServer;
  tableName: string;
  viewId: string;
  isSharingPage: boolean;
}) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 15;
  const sort = searchParams.sort as string;
  const searchQ = searchParams.search_q as string;
  const searchField = searchParams.search_field as string;
  const filters = searchParams.filters as string;
  const sorts = searchParams.sorts as string;

  const query = schema.viewQuery(tableName, viewId);

  if (filters) {
    try {
      const filtersObject = JSON.parse(atob(filters));
      schema.withQuery(query, filtersObject);
    } catch (e) {}
  }

  if (sorts) {
    try {
      const sortsObject = JSON.parse(atob(sorts));
      schema.withQuery(query, sortsObject);
    } catch (e) {}
  }

  if (sort) {
    const [key, order] = sort.split(" ");
    query.clearOrder().orderBy(key, order != 'desc' ? 'asc' : 'desc');
  }

  if (searchQ && searchField) {
    query.where(searchField, 'like', `%${searchQ}%`);
  }
  
  const data = await query.paginate(page, pageLimit);

  return <GridView
    schema={schema.safe()}
    baseId={schema.schema.id}
    tableName={tableName}
    // dataPromise={data}
    data={data.toData()}
    isSharingPage={isSharingPage}
  />;
}

export default async function View(props: {
  searchParams: Record<string, string | string[] | undefined>;
  params: any;
  tableSchema: any;
  schema: SchemaServer;
  tableName: string;
  viewId: string;
  isSharingPage: boolean;
}) {
  const { viewId, tableSchema } = props;

  const rendowView = () => {
    switch (tableSchema.views?.[viewId]?.type) {
      case 'grid':
      default:
        return <Grid {...props} />;
    }
  }

  try {
    return <>
      {rendowView()}
      <ModalDetail
        disabled={props.isSharingPage}
      />
    </>
  } catch (error: any) {
    console.error(error);
    return <EnhancedError details={error.message} />
  }
}