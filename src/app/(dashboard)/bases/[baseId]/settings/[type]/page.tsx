import TypeList from "@/components/base-settings/type-list";
import SchemaServer from "@/lib/schema-server";
import startCase from "lodash/startCase";
import { cache } from "react";
import Table from "@/components/base-settings/table";
import Connection from "@/components/base-settings/connection";
import { ProviderType } from "@/lib/types";
import { redirect } from "next/navigation";
import { denies } from "@/lib/utils";
import Bar from "@/components/bar";
import Link from "next/link";
import { ChevronRightIcon, ClockIcon, DatabaseIcon } from "lucide-react";
import BaseSchema from "@/components/base-settings/schema";
import { getTranslations } from "next-intl/server";

const getSchema = cache(SchemaServer.load);

export async function generateMetadata({ params }: any) {
  const { baseId } = params;
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      title: '404'
    }
  }

  const t = await getTranslations('Base.Settings');

  return {
    title: `${t('settings')} | ${schema?.schema?.label}`
  };
}

type PageProps = {
  params: {
    baseId: string;
    type: string;
  }
}

export default async function Page({ params, ...props }: PageProps) {
  const { baseId } = params;
  const schema = await getSchema(baseId);
  const t = await getTranslations('Base.Settings');

  if (schema === null) {
    redirect(`/404`);
  }

  if (denies(schema.schema.role, 'base:update')) {
    redirect(`/404`);
  }

  const breadcrumbItems = [
    { title: schema.get().label || startCase(baseId), link: `/bases/${baseId}` },
    { title: 'Settings', link: `/bases/${baseId}` },
  ];

  const renderType = (type: string ) => {
    const provider = schema.getProvider();
    switch (type) {
      case 'table':
        return <Table schema={schema.safe()} />;
      case 'connection':
        if (!provider || provider === 'default') {
          redirect(`/bases/${baseId}`);
        }

        return <Connection
          workspaceId={schema.schema.workspace_id as string}
          baseId={baseId}
          label={schema.schema.label as string}
          provider={provider}
          connection={schema.schema.connection}
        />
      case 'schema':
        if (!provider || provider === 'default') {
          redirect(`/bases/${baseId}`);
        }

        return <BaseSchema schema={schema.safe()} />;
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
          <div className="size-7 flex items-center justify-center"><DatabaseIcon className="size-5" /></div>
          <Link href={breadcrumbItems[0]?.link}><div className="text-sm">{breadcrumbItems[0]?.title}</div></Link>
          <ChevronRightIcon className="text-muted-foreground size-4" />
          <div className="text-sm">{t('settings')}</div>
        </div>
      </Bar>
      <TypeList
        provider={schema.getProvider() as ProviderType}
      />
      {renderType(params.type)}
    </div>
  </>
}