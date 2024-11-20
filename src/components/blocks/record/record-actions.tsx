'use client';

import { FilesIcon, LinkIcon, MoreHorizontalIcon, Settings2Icon, TrashIcon } from "lucide-react";
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
import { useSchemaStore } from "@/store/base";
import { WebhookSchemaType } from "@/lib/schema-builder";
import { touchWebhook } from "@/actions/webhook";

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
  const schema = useSchemaStore(store => store.schema);
  const actions: WebhookSchemaType[] = [];
  const webhooks = schema?.getWebhooks(tableName);
  Object.values(webhooks || {}).forEach((webhook) => {
    if (webhook?.type === 'action') {
      actions.push(webhook);
    }
  });

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

  const handleTouchWebhook = (action: WebhookSchemaType) => {
    toast.promise(touchWebhook({
      baseId: baseId,
      tableName: tableName,
      webhookId: action.id,
      params: {
        recordIds: [recordId],
      },
    }), {
      loading: t('loading'),
      success: (result) => {
        if (result.error) {
          throw new Error(result.error);
        }

        return t('success');
      },
      error: e => e.message,
    });
  };

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
          }}>
            <TrashIcon className="mr-2 h-4 w-4 text-red-500" /> {t('delete')}
          </DropdownMenuItem>
          {(actions.length > 0) && <DropdownMenuSeparator />}
          {actions.map((action) => {
            return <DropdownMenuItem key={action.id} onClick={() => handleTouchWebhook(action)}>
              <Settings2Icon className="mr-2 h-4 w-4"/> {action.label}
            </DropdownMenuItem>
          })}
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