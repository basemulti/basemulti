import React, { cache } from "react";
import startCase from "lodash/startCase";
import { redirect } from "next/navigation";
import { DataDetailTabs } from "@/components/details/model-detail-tabs";
import { editRecord } from "@/actions/record";
import SchemaServer from "@/lib/schema-server";
import Bar from "@/components/bar";
import { appString } from "@/lib/utils";
import { PageDetail } from "@/components/details/page-detail";
import { getTranslations } from "next-intl/server";

const getSchema = cache(SchemaServer.load);

type PageProps = {
  params: {
    baseId: string;
    tableName: string;
    recordId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { baseId, recordId } = params;
  let tableName = decodeURIComponent(params.tableName);
  const schema = await getSchema(baseId);
  const t = await getTranslations('Record');

  if (!schema) {
    redirect('/404');
  }
  const tableSchema = schema.getTableSchema(tableName);

  const initialData = await schema.relationQuery(tableName).find(recordId) as any;

  if (!initialData) {
    redirect('/404');
  }
  
  const relationTabs: {
    label: string;
    value: string;
    table: string;
  }[] = [{
    label: t('details'),
    value: appString('record_details'),
    table: '',
  }];

  if (Object.keys(tableSchema?.relations || {}).length > 0 && initialData) {
    for (let relationName in tableSchema.relations) {
      const relation = tableSchema.relations[relationName];

      if (! ['has_many', 'belongs_to_many'].includes(relation.type)) {
        continue;
      }

      relationTabs.push({
        label: relation.label ?? startCase(relationName),
        value: relationName,
        table: relation.table,
      });
    }
  }

  return (
    <>
      <Bar>
        <div className="flex flex-row items-center gap-2">
          <DataDetailTabs
            tabs={relationTabs}
            params={params}
            tabValue={appString('record_details')}
          />
        </div>
      </Bar>
      <PageDetail
        baseId={baseId}
        tableName={tableName}
        recordId={recordId}
        tableSchema={tableSchema}
        initialData={initialData?.toData()}
        key={null}
        submit={editRecord}
      />
    </>
  );
}
