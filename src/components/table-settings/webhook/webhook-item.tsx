import { cn } from "@/lib/utils";
import { EditIcon, EllipsisIcon, TrashIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CreateWebhook from "./create-webhook";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertModal } from "@/components/modal/alert-modal";
import { deleteWebhook, updateWebhook } from "@/actions/webhook";
import { usePathname } from "next/navigation";

type WebhookItemProps = {
  webhook: any;
}

export default function WebhookItem({
  webhook,
}: WebhookItemProps) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [webhookDeleting, setWebhookDeleting] = useState<boolean>(false);
  const t = useTranslations('Table.Settings.Webhooks');
  const pathname = usePathname();
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleToggleWebhook = (value: boolean) => {
    updateWebhook({
      baseId: webhook.base_id,
      webhookId: webhook.id,
      active: value,
    }).then(result => {
      if (result?.error) {
        throw new Error(result.error);
      }
    }).catch(e => {
      toast.error(e.message);
    });
  }

  const handleDeleteWebhook = () => {
    setWebhookDeleting(true);
    deleteWebhook({ baseId: webhook.base_id, webhookId: webhook.id }, {
      originalPath: pathname
    }).then(result => {
      if (result?.error) {
        throw new Error(result.error);
      }
    }).catch(e => {
      toast.error(e.message);
      setWebhookDeleting(false);
    }).finally(() => {
      setDeleteOpen(false);
      setWebhookDeleting(false);
    });
  }

  return <>
    <div
      className={cn(
        "w-full flex flex-col items-start px-5 py-3 gap-2",
      )}
    >
      <div className="w-full flex flex-row items-center relative">
        <div className="pr-20 flex items-center gap-2 overflow-hidden">
          <div className="text-base font-medium truncate">{webhook.label}</div>
        </div>
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <Switch
            defaultChecked={webhook.active}
            onCheckedChange={handleToggleWebhook}
          />
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant={'outline'} className="w-6 h-6 p-0">
                <EllipsisIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="">
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer gap-2 h-8 text-sm" onSelect={() => {
                  triggerRef.current?.click();
                }}>
                  <EditIcon className="size-4" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 h-8 text-sm" onSelect={() => setDeleteOpen(true)}>
                  <TrashIcon className="size-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="w-full flex flex-row items-center gap-2">
        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-600">{webhook.method}</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-600">{webhook.type}</span>
        <span className="text-xs px-1 py-0.5 rounded-sm bg-gray-50 text-gray-500 border border-gray-300 truncate cursor-pointer" onClick={() => {
          navigator.clipboard.writeText(webhook.endpoint);
          toast.success('Copied to clipboard');
        }}>
          {webhook.endpoint}
        </span>
      </div>
    </div>
    <CreateWebhook baseId={webhook.base_id} tableName={webhook.table_name} initData={webhook}>
      <div ref={triggerRef} className="hidden"></div>
    </CreateWebhook>
    <AlertModal
      isOpen={deleteOpen}
      onClose={() => setDeleteOpen(false)}
      onConfirm={handleDeleteWebhook}
      loading={webhookDeleting}
    />
  </>
}