import { NextResponse } from 'next/server'
import SchemaServer from '@/lib/schema-server';
import { cache } from 'react';

const getSchema = cache(SchemaServer.load);

export async function GET(
  req: Request,
  { params }: any
) {
  const { baseId, tableName } = params;
  const schema = await getSchema(baseId);

  if (!schema) {
    return NextResponse.json({});
  }

  if (schema.hasTable(tableName) === false) {
    return NextResponse.json({});
  }
  
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  const pageLimit = Number(searchParams.get('limit')) || 15;
  const sort = searchParams.get('sort') as string;
  const searchQ = searchParams.get('search_q') as string;
  const searchField = searchParams.get('search_field') as string;
  const filters = searchParams.get('filters') as string;
  const sorts = searchParams.get('sorts') as string;

  const query = schema.query(tableName);

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

  return NextResponse.json(data);
}
