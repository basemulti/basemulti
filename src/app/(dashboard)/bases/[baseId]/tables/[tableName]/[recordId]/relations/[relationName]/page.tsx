import React, { cache } from "react";
import startCase from "lodash/startCase";
import { redirect } from "next/navigation";
import { DataDetailTabs } from "@/components/details/model-detail-tabs";
import SchemaServer from "@/lib/schema-server";
import Bar from "@/components/bar";
import { appString } from "@/lib/utils";
import RelationView from "@/components/blocks/view/relation-view";
import { getTranslations } from "next-intl/server";

const getSchema = cache(SchemaServer.load);

type PageProps = {
  params: {
    baseId: string;
    tableName: string;
    recordId: string;
    relationName: string;
  };
  searchParams: any;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { baseId, recordId, relationName } = params;
  let tableName = decodeURIComponent(params.tableName);
  const schema = await getSchema(baseId);
  if (!schema) {
    redirect(`/404`);
  }

  const t = await getTranslations('Record');
  const tableSchema = schema.getTableSchema(tableName);

  const record = await schema.relationQuery(tableName).find(recordId) as any;
  const relationTabs: {
    label: string;
    value: string;
    table: string;
  }[] = [{
    label: t('details'),
    value: appString('record_details'),
    table: '',
  }];

  if (!record) {
    redirect(`/bases/${baseId}/tables/${tableName}`);
  }

  if (Object.keys(tableSchema?.relations || {}).length > 0) {
    for (let relationName in tableSchema.relations) {
      const relationSetting = tableSchema.relations[relationName];

      if (! ['has_many', 'belongs_to_many'].includes(relationSetting.type)) {
        continue;
      }

      relationTabs.push({
        label: relationSetting.label ?? startCase(relationName),
        value: relationName,
        table: relationSetting.table,
      });
    }
  }

  if (!schema.hasRelation(tableName, relationName)) {
    return <div className="size-full flex items-center justify-center">Wrong Relation.</div>
  }

  return (
    <>
      <Bar>
        <div className="flex flex-row items-center gap-2">
          <DataDetailTabs
            tabs={relationTabs}
            params={{
              baseId,
              tableName,
              recordId,
            }}
            tabValue={relationName}
          />
        </div>
      </Bar>
      <RelationView
        schema={schema}
        params={params}
        searchParams={searchParams}
        record={record}
        relationName={relationName}
        tableSchema={tableSchema}
        tableName={tableName}
        isSharingPage={false}
      />
    </>
  );
}
