'use client';

import { FilesIcon, LinkIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { sleep, url } from "@/lib/utils";
import { AlertModal } from "@/components/modal/alert-modal";
import { deleteRecord } from "@/actions/record";
import { useTranslations } from "next-intl";

export default function RecordActions({ baseId, tableName, recordId, size, onDelete }: {
  baseId: string;
  tableName: string;
  recordId: string;
  size?: string;
  onDelete?: (id: string | number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Record.Actions');

  const handleDeleteRecord = () => {
    if (deleting) return;
    setDeleting(true);
    deleteRecord({
      baseId,
      tableName,
      id: recordId
    }, {
      originalPath: pathname,
    })
    .then(result => {
      if (result.error) {
        throw new Error(result.error);
      }
      onDelete && onDelete(recordId);
    })
    .catch (e => {
      toast.error(e.message);
    })
    .finally(() => {
      setDeleting(false);
      setOpen(false);
    });
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer" onClick={() => {
            navigator.clipboard.writeText(url(`/bases/${baseId}/tables/${tableName}/${recordId}`));
            toast.success("Copied to clipboard");
          }}>
            <LinkIcon className="w-4 h-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('copy_link')}</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer">
            <MoreHorizontalIcon className="w-4 h-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
          {/* <DropdownMenuItem>
            <FilesIcon className="mr-2 h-4 w-4" /> {t('duplicate')}
          </DropdownMenuItem> */}
          <DropdownMenuItem className="text-red-500" onClick={() => {
            setOpen(true);
            // toast.promise(
            //   sleep(3000),
            //   {
            //     loading: "Deleting...",
            //     success: "Deleted",
            //     error: "Failed to delete",
            //   }
            // );
          }}>
            <TrashIcon className="mr-2 h-4 w-4 text-red-500" /> {t('delete')}
          </DropdownMenuItem>
          {/* <DropdownMenuSeparator /> */}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteRecord}
        loading={deleting}
      />
    </div>
  );
}