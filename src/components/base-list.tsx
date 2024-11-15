"use client";

import orderCollection from "lodash/orderBy";
import {
  LayoutGridIcon,
  CalendarArrowUp,
  CalendarArrowDown,
  ArrowDownAZIcon,
  ArrowDownZAIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import CreateBaseButton from "./create-base-button";
import { AlertModal } from "./modal/alert-modal";
import { removeWorkspace } from "@/actions/workspace";
import { useParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import Tabs from "./workspace/tabs";
import BaseCard from "./base-card";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function BaseList({ workspaces }: { workspaces: any }) {
  const [orderBy, setOrderBy] = useState<[string, "desc" | "asc"]>([
    "created_at",
    "desc",
  ]);
  const [workspaceDeleting, setWorkspaceDeleting] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { workspaceId }: {
    workspaceId: string;
  } = useParams();
  const router = useRouter();
  const t = useTranslations('Workspace');

  let bases: any[] = [];
  workspaces.map((workspace: any) => {
    bases.push(...workspace.bases);
  });

  bases = orderCollection(bases, [orderBy[0]], [orderBy[1]]);

  const handleDeleteWorkspace = () => {
    setWorkspaceDeleting(true);
    removeWorkspace({
      id: workspaceId,
    })
      .then((result) => {
        if (result?.error) {
          throw new Error(result?.error);
        }
        router.replace("/workspaces");
      })
      .catch(e => {
        toast.error(e?.message);
      })
      .finally(() => {
        setWorkspaceDeleting(false);
        setDeleteOpen(false);
      });
  };

  function renderOrderIcon() {
    switch (orderBy.join("-")) {
      case "created_at-desc":
        return <CalendarArrowDown className={"size-4"} />;
      case "created_at-asc":
        return <CalendarArrowUp className={"size-4"} />;
      case "label-desc":
        return <ArrowDownZAIcon className={"size-4"} />;
      case "label-asc":
        return <ArrowDownAZIcon className={"size-4"} />;
      default:
        return null;
    }
  }

  return (
    <>
      <Tabs>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="h-8 flex items-center justify-center cursor-pointer whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all  disabled:pointer-events-none disabled:opacity-50 border border-border hover:border-border px-2 py-1 gap-2">
              <LayoutGridIcon className="size-4" />
              {t('Tabs.Bases.bases')}
              {renderOrderIcon()}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            <DropdownMenuRadioGroup
              value={orderBy[0]}
              onValueChange={(value) =>
                setOrderBy([value, value === "created_at" ? "desc" : "asc"])
              }
            >
              <DropdownMenuRadioItem
                value={"created_at"}
                className="cursor-pointer gap-2"
              >
                {t('Tabs.Bases.created_time')}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value={"label"}
                className="cursor-pointer gap-2"
              >
                {t('Tabs.Bases.alphabetical')}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={orderBy[1]}
              onValueChange={(value) =>
                setOrderBy([orderBy[0], value as "desc" | "asc"])
              }
            >
              <DropdownMenuRadioItem
                value={"asc"}
                className="cursor-pointer gap-2"
              >
                {t(orderBy[0] === "created_at" ? "Tabs.Bases.oldest_to_newest" : "Tabs.Bases.a_to_z")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value={"desc"}
                className="cursor-pointer gap-2"
              >
                {t(orderBy[0] === "created_at" ? "Tabs.Bases.newest_to_oldest" : "Tabs.Bases.z_to_a")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tabs>
      <div className="overflow-y-scroll px-10 py-4 bg-muted/50 flex-1">
        {bases.length > 0 ? (
          <div className="grid grid-cols-5 gap-4">
            {bases.map((base) => <BaseCard key={base.id} base={base} />)}
          </div>
        ) : (
          <div className="size-full flex flex-col items-center justify-center gap-2">
            {t('empty')}
            <CreateBaseButton workspace={workspaceId} />
          </div>
        )}
      </div>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteWorkspace}
        loading={workspaceDeleting}
      />
    </>
  );
}
