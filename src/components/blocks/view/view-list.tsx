"use client";

import { useParams, useSearchParams } from "next/navigation";
import React, { useRef, useState } from "react";
import { startProgress, stopProgress } from "next-nprogress-bar";
import { ChevronDownIcon, DownloadIcon, EditIcon, FileInputIcon, FileOutputIcon, FilesIcon, LayoutGridIcon, TrashIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import CreateView from "./create-view";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteView, duplicateView, updateViewName } from "@/actions/view";
import AutoWidthInput from "@/components/auto-width-input";
import { ViewType } from "@/lib/schema-builder";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Bar from "@/components/bar";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type ViewListProps = {
  tabs: ViewType[];
  prefix?: string;
}

export default function ViewList({ tabs, prefix }: ViewListProps) {
  const { baseId, tableName: paramTableName }: {
    baseId: string;
    tableName: string;
  } = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const searchParams = useSearchParams();
  const paramPrefix = prefix ? prefix + '_' : '';
  const tab = searchParams?.get(paramPrefix + "tab") ?? tabs[0].value;
  const [loading, setLoading] = useState(false);
  const [renameing, setRenameing] = useState(false);
  const viewInputRef = useRef(null);
  const t = useTranslations('ViewBar');

  const handleRenameView = () => {
    setRenameing(true)
  }

  const handleUpdateViewName = async (oldName: string, newName: string) => {
    if (newName.length === 0) {
      toast.error("View name is required");
      // @ts-ignore
      viewInputRef?.current?.focus();
      setRenameing(false);
      return ;
    }

    if (newName === oldName) {
      setRenameing(false);
      return ;
    }

    if (!tab) return;

    startProgress();
    await updateViewName({
      baseId: baseId,
      tableName: tableName,
      viewId: tab,
      label: newName
    });

    setRenameing(false);
    stopProgress();
  }

  const handleDuplicateView = async (view: ViewType) => {
    startProgress();
    await duplicateView({
      baseId: baseId,
      tableName: tableName,
      viewId: view.value as string,
    });
    stopProgress();
  }

  const handleDeleteView = async () => {
    if (loading || !tab) {
      return;
    }

    setLoading(true);
    startProgress();
    deleteView({
      baseId: baseId,
      tableName: tableName,
      viewId: tab
    })
      .then(result => {
        if (result?.error) {
          throw new Error(result.error);
        }
      })
      .catch(e => {
        toast.error(e.message);
      })
      .finally(() => {
        stopProgress();
        setLoading(false);
      });
  };

  const handleExport = () => {
    window.open(`/api/bases/${baseId}/tables/${tableName}/export?viewId=${tab}`, '_blank');
  }

  return <Bar>
    <div className="w-4/5 flex items-center gap-1">
      <ScrollArea className="max-w-full relative h-[50px]">
        <div className="inline-flex h-[50px] items-center justify-center rounded-lg text-muted-foreground bg-transparent gap-1">
          {tabs.map((item: ViewType) => tab === item.value 
          ? (renameing ? <div
              key={item.value}
              className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all  disabled:pointer-events-none disabled:opacity-50 text-foreground border hover:border-border border-border px-2 h-8 gap-1 cursor-pointer bg-muted "
            >
              <LayoutGridIcon className="mr-1 size-4" />
              <AutoWidthInput
                ref={viewInputRef}
                className="bg-muted min-w-10 focus-visible:outline-none"
                defaultValue={item.label}
                onBlur={handleUpdateViewName}
              />
            </div> : <DropdownMenu key={item.value} modal={false}>
              <DropdownMenuTrigger asChild>
                <div className={cn(
                  buttonVariants({ variant: "outline" }),
                  'h-8 gap-1 px-2 cursor-pointer'
                )}>
                  <LayoutGridIcon className="mr-1 size-4" />
                  {item.label}
                </div>
                {/* <div
                  className="h-8 flex items-center justify-center select-none whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all  disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground border hover:border-border border-border px-2 py-1 gap-1 cursor-pointer"
                  onDoubleClick={handleRenameView}
                >
                  <LayoutGridIcon className="mr-1 size-4" />
                  {item.label}
                </div> */}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={handleRenameView}>
                  <EditIcon className="mr-2 size-4" /> {t('Actions.rename')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicateView(item)}>
                  <FilesIcon className="mr-2 size-4" /> {t('Actions.duplicate')}
                </DropdownMenuItem>
                {tabs.length > 1 && <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteView} disabled={loading}>
                    <TrashIcon className="mr-2 size-4 text-red-500" />
                    <span className="text-red-500">{t('Actions.delete')}</span>
                  </DropdownMenuItem>
                </>}
              </DropdownMenuContent>
            </DropdownMenu>)
          : <Link key={item.value} href={`/bases/${baseId}/tables/${tableName}?tab=${item.value}`}>
            <div
              className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-transparent hover:border-border px-2 h-8 gap-1"
            >
              <LayoutGridIcon className="mr-1 size-4" />
              {item.label}
            </div>
          </Link>)}
        </div>
        <ScrollBar orientation="horizontal" className="self-end bottom-0 absolute"  />
      </ScrollArea>
      <CreateView />
    </div>
    <div className="flex gap-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 gap-1 px-3">
            <DownloadIcon className="size-4" />
            {t('Import.text')}
            <ChevronDownIcon className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport}>
            <FileOutputIcon className="mr-2 size-4" />
            {t('Import.export')}
          </DropdownMenuItem>
          {/* <DropdownMenuSeparator /> */}
          {/* <DropdownMenuItem onClick={handleDeleteView}>
            <FileInputIcon className="mr-2 size-4" />
            {t('Import.import')}
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </Bar>
}
