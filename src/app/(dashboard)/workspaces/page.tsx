'use server';

import { User } from "@/database";
import { cache } from "react";
import WorkspaceList from "@/components/workspace-list";
import { getCurrentUser, getSettings } from "@/lib/server";
import GlobalInitializer from "@/components/global-initalizer";

type PageProps = {
  params: {
    base: string
    table: string
  },
  searchParams: Record<string, string | string[] | undefined>;
};

const getWorkspaces = cache(User.getWorkspaces);

export default async function Page({ params, searchParams }: PageProps) {
  const user = await getCurrentUser();
  const wspaces = await getWorkspaces(user as User);
  const workspaces = wspaces.toData();
  const settings = await getSettings();

  return (
    <>
      <GlobalInitializer
        user={user?.toData()}
        workspaces={workspaces}
      >
        <div className="flex-1 size-full flex flex-col">
          <div>
            <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-2">
                <div className="text-base font-bold">All Workspaces</div>
              </div>
            </div>
          </div>
          <WorkspaceList
            workspaces={workspaces}
            allowCreateWorkspace={settings.allow_create_workspace}
          />
        </div>
      </GlobalInitializer>
    </>
  );
}
