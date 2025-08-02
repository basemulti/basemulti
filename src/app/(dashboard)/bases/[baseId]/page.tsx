import startCase from "lodash/startCase";
import { cache } from "react";
import SchemaServer from "@/lib/schema-server";
import Bar from "@/components/bar";
import { DatabaseIcon, SquareLibraryIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

type PageProps = {
  params: {
    baseId: string
    tableName: string
  },
  searchParams: Record<string, string | string[] | undefined>;
};

const getSchema = cache(SchemaServer.load);

export default async function page({ params, searchParams }: PageProps) {
  const { baseId } = params;
  const schema = await getSchema(baseId);
  const t = await getTranslations('Table.Home');

  const breadcrumbItems = [
    { title: schema?.get()?.label || startCase(baseId), link: `/bases/${baseId}` },
  ];

  return (
    <>
      <div className="flex-1 size-full flex flex-col">
        <Bar>
          <div className="flex flex-row items-center gap-2">
            <div className="size-7 flex items-center justify-center"><DatabaseIcon className="size-5" /></div>
            <Link href={breadcrumbItems[0]?.link}><div className="text-sm">{breadcrumbItems[0]?.title}</div></Link>
          </div>
        </Bar>
        <div className="size-full flex flex-col items-center justify-center gap-4">
          {/* <div className="rounded-md shadow p-6 border border-border"> */}
            <div className="bg-muted rounded-md p-2">
              <SquareLibraryIcon className="size-8 text-muted-foreground" />
            </div>
            <div className="text-sm mb-10">{t('prompt')}</div>
          {/* </div> */}
        </div>
      </div>
    </>
  );
}
