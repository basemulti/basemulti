import GlobalInitializer from "@/components/global-initalizer";
import { getCurrentUser, getUserWorkspace } from "@/lib/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: any) {
  const user = await getCurrentUser();
  const wspace = await getUserWorkspace(user, params.workspaceId);
  const t = await getTranslations('Metadata');
 
  return {
    title: wspace?.label || t('loading')
  };
}

type LayoutProps = {
  children: React.ReactNode;
  params: {
    workspaceId: string
  };
};

export default async function Layout({ children, params }: LayoutProps) {
  const user = await getCurrentUser();
  const wspace = await getUserWorkspace(user, params.workspaceId);

  if (!wspace) {
    return redirect('/workspaces');
  }

  const workspace = wspace.toData();

  return <GlobalInitializer
    user={user?.toData()}
    workspaces={[workspace]}
  >
    {children}
  </GlobalInitializer>
}