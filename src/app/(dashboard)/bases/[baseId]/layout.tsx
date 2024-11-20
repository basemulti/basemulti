// import Sidebar from "@/components/layout/sidebar";
import type { Metadata } from "next";
import { cache, Suspense } from "react";
import ProgressBar from "@/components/progress-bar";
import { getCurrentUser } from "@/lib/server";
import { redirect } from "next/navigation";
import SchemaServer from "@/lib/schema-server";
import AppInitializer from "@/components/app-initializer";
import { allows, getRole } from "@/lib/utils";
import Loading from "@/components/loading";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BaseSidebar } from "@/components/blocks/sidebar/base-sidebar";
import BaseSelector from "@/components/base-selector";

export async function generateMetadata({ params }: any) {
  const { baseId } = params;
  const schema = await getSchema(baseId);

  return {
    title: schema?.schema?.label
  };
}

const getSchema = cache(SchemaServer.load);

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any
}) {
  const { baseId } = params;
  const user = await getCurrentUser();
  const schema = await getSchema(baseId);

  if (!schema) {
    redirect('/404');
  }

  await schema.loadWebhooks(['action', 'bulk-action']);
  const sidebarItems = schema?.sidebar() ?? [];

  return (
    <>
      {/* <Header /> */}
      <AppInitializer
        schema={schema.safe()}
        user={user?.toData()}
        base={{
          id: baseId,
          workspace_id: schema.schema.workspace_id as string,
          label: schema.schema.label as string,
          role: getRole(schema.getRole()),
          created_at: schema.schema.created_at as string,
          updated_at: schema.schema.updated_at as string,
        }}
      >
        <SidebarProvider>
          <BaseSidebar
            tables={sidebarItems}
            showSetting={allows(schema.getRole(), 'base:update')}
            showCreate={schema.isDefaultProvider()}
          >
            <BaseSelector params={params} />
          </BaseSidebar>
          <SidebarInset>
            <main className="h-screen overflow-y-hidden w-[calc(100vw-320px)]">
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
            </main>
          </SidebarInset>
        </SidebarProvider>
        {/* <div className="flex h-screen overflow-hidden">
          <Sidebar params={params} />
          <main className="h-screen overflow-y-hidden w-[calc(100vw-320px)]">
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </main>
        </div> */}
      </AppInitializer>
      <ProgressBar />
    </>
  );
}