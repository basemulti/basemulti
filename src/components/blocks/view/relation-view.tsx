'use server';

import SchemaServer from "@/lib/schema-server";
import EnhancedError from "@/components/enhanced-error";
import { GridView } from "@/components/blocks/view/grid-view";
import ModalDetail from "@/components/details/modal-detail";
import { Relation } from "sutando";

async function Grid({ searchParams, record, relationName, schema, tableName, isSharingPage, tableSchema }: {
  searchParams: Record<string, string | string[] | undefined>;
  params: any;
  tableSchema: any;
  schema: SchemaServer;
  tableName: string;
  record: any;
  relationName: string;
  isSharingPage: boolean;
}) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 15;
  const sort = searchParams.sort as string;
  const searchQ = searchParams.search_q as string;
  const searchField = searchParams.search_field as string;
  const filters = searchParams.filters as string;
  const sorts = searchParams.sorts as string;

  const relationSetting = tableSchema.relations[relationName];
  const query = record?.related(relationName) as Relation<any>;
  schema.withRelationQuery(query, relationSetting.table);

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
    tableName={relationSetting.table}
    // dataPromise={data}
    data={data.toData()}
    isSharingPage={isSharingPage}
  />;
}

export default async function RelationView(props: {
  searchParams: Record<string, string | string[] | undefined>;
  record: any;
  params: any;
  tableSchema: any;
  schema: SchemaServer;
  relationName: string; 
  tableName: string;
  isSharingPage: boolean;
}) {
  const rendowView = () => {
    return <Grid {...props} />;
  }

  try {
    return <>
      {rendowView()}
      <ModalDetail />
    </>
  } catch (error: any) {
    console.error(error);
    return <EnhancedError details={error.message} />
  }
}