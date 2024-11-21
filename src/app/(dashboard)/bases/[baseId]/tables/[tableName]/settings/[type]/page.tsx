import { createView } from "@/actions/view";
import Bar from "@/components/bar";
import Error from "@/components/error";
import TableIconSelector from "@/components/table-icon-selector";
import Field from "@/components/table-settings/field";
import Graph from "@/components/table-settings/graph/graph";
import Relation from "@/components/table-settings/relation";
import Webhook from "@/components/table-settings/webhook";
import TypeList from "@/components/table-settings/type-list";
import SchemaServer from "@/lib/schema-server";
import startCase from "lodash/startCase";
import { ChevronRightIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cache } from "react";
import { Webhook as WebhookModel } from '@/database';

const getSchema = cache(SchemaServer.load);

type PageProps = {
  params: {
    baseId: string;
    tableName: string;
    type: string;
  };
}

export default async function Page({ params, ...props }: PageProps) {
  const { baseId, type } = params;
  let tableName = decodeURIComponent(params.tableName);

  const schema = await getSchema(baseId);

  if (!schema) {
    redirect('/404');
  }

  const tableSchema = schema.getTableSchema(tableName);
  const tabs = schema.table(tableName).tabs();

  if (tabs.length === 0) {
    const result = await createView({
      baseId: baseId,
      tableName: tableName,
      label: 'All'
    });
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
    { title: schema.get().label || startCase(baseId), link: `/bases/${baseId}` },
    { title: tableSchema?.label, link: `/bases/${baseId}/tables/${tableName}`, list: tabs },
    { title: 'Settings', link: `/bases/${baseId}/tables/${tableName}` },
  ];

  const webhooks = type === 'webhook' ? (await WebhookModel.query().where({
    base_id: baseId,
    table_name: tableName
  }).get()).toData() : [];

  const renderType = (type: string) => {
    switch (type) {
      case 'field':
        return <Field schema={schema.safe()} />;
      case 'graph':
        return <Graph schema={schema.safe()} />;
      case 'relation':
        return <Relation schema={schema.safe()} />;
      case 'webhook':
        return <Webhook
          schema={schema.safe()}
          webhooks={webhooks}
        />;
      default:
        return <div className="size-full flex flex-col items-center justify-center gap-4">
          <ClockIcon className="size-10" />
          Coming soon
        </div>
    }
  }

  return <>
    <div className="flex-1 size-full flex flex-col">
      <Bar>
        <div className="flex flex-row items-center gap-2">
          <TableIconSelector baseId={baseId} tableName={tableName} />
          <Link href={breadcrumbItems[1]?.link}><div className="text-sm">{breadcrumbItems[1]?.title}</div></Link>
          <ChevronRightIcon className="text-muted-foreground size-4" />
          <div className="text-sm">{breadcrumbItems[2]?.title}</div>
        </div>
        <div className="flex flex-row items-center gap-2">

        </div>
      </Bar>
      <TypeList />
      {renderType(type)}
    </div>
  </>
}