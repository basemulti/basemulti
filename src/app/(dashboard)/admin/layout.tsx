import { cache, Suspense } from "react";
import ProgressBar from "@/components/progress-bar";
import Loading from "@/components/loading";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getTranslations } from "next-intl/server";
import { ManageSidebar } from "@/components/blocks/sidebar/manage-sidebar";
import { getCurrentUser } from "@/lib/server";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

export async function generateMetadata() {
  const t = await getTranslations('Metadata');
 
  return {
    title: t('AllWorkspaces')
  };
}

async function Sidebar() {
  return <ManageSidebar />;
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.email !== env.ADMIN_EMAIL) {
    return redirect('/');
  }

  return (
    <>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </SidebarInset>
      </SidebarProvider>
      <ProgressBar />
    </>
  );
}