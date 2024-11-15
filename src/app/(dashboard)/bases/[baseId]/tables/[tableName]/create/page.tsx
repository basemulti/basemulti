import BreadCrumb from "@/components/breadcrumb";
import { ModelForm } from "@/components/details/model-form";
import React, { cache } from "react";
import { LinkIcon } from "lucide-react";
import SchemaServer from "@/lib/schema-server";
import { createRecord } from "@/actions/record";
import { redirect } from "next/navigation";
import Bar from "@/components/bar";

const getSchema = cache(SchemaServer.load);

type PageProps = {
  params: {
    baseId: string,
    tableName: string
  }
}

export default async function Page({ params }: PageProps) {
  const { baseId } = params;
  const schema = await getSchema(baseId);
  let tableName = decodeURIComponent(params.tableName);

  if (!schema) {
    redirect('/404');
  }

  const tableSchema = schema.getTableSchema(tableName);

  const breadcrumbItems = [
    { title: tableSchema.label, link: `/bases/${baseId}/tables/${tableName}` },
    { title: "Create", link: `/bases/${baseId}/tables/${tableName}/create` },
  ];
  
  return (
    <div className="flex-1 size-full flex flex-col">
      <Bar>
        <div className="flex flex-row items-center gap-2">
          <BreadCrumb items={breadcrumbItems} />
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 cursor-pointer">
            <LinkIcon className="w-4 h-4" />
          </div>
        </div>
      </Bar>
      <div>
        <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            {/* <DataDetailTabs tabs={relationTabs} /> */}
          </div>
        </div>
      </div>
      <ModelForm
        schema={schema}
        baseId={baseId}
        tableName={tableName}
        key={null}
        submit={createRecord}
        data={{}}
      />
    </div>
  );
}
