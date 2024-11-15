import { cache, Suspense } from "react";
import ProgressBar from "@/components/progress-bar";
import Loading from "@/components/loading";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/blocks/sidebar/workspace-sidebar";
import { getCurrentUser } from "@/lib/server";
import { User } from "@/database";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations('Metadata');
 
  return {
    title: t('AllWorkspaces')
  };
}

const getWorkspaces = cache(User.getWorkspaces);
async function Sidebar() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect('/login?callbackUrl=/workspaces');
  }
  const workspaces = await getWorkspaces(user as User);

  return <WorkspaceSidebar workspaces={workspaces.toData()} />;
}

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any
}) {
  return (
    <>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset>
          {/* <div className="flex h-screen overflow-hidden"> */}
            {/* <WorkspaceSidebar params={params} /> */}
            {/* <main className="h-screen overflow-y-hidden w-[calc(100vw-320px)]"> */}
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
            {/* </main> */}
          {/* </div> */}
        </SidebarInset>
      </SidebarProvider>
      <ProgressBar />
    </>
  );
}