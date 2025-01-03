"use client";
import { AlertModal } from "@/components/modal/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyIcon, Maximize2Icon, MoreHorizontal, Settings2, SquareSquareIcon, Trash } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { deleteRecord } from "@/actions/record";
import { useRouter } from "next-nprogress-bar";
import { toast } from "sonner";
import { useGlobalStore } from "@/store/global";
import { useTranslations } from "next-intl";
import { WebhookSchemaType } from "@/lib/schema-builder";
import { touchWebhook } from "@/actions/webhook";

interface CellActionProps {
  data: any;
  meta?: any;
  actions?: WebhookSchemaType[];
  actionsDisabled?: boolean;
  primaryKey: string;
}

export const CellAction: React.FC<CellActionProps> = ({ data, meta, actions = [], actionsDisabled, primaryKey }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { openDetailModal } = useGlobalStore();
  const pathname = usePathname();
  const { baseId, tableName: paramTableName }: {
    baseId: string;
    tableName: string;
  } = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const t = useTranslations('GridView.Actions');
  // const schema = useSchemaStore(store => store.schema);

  const onConfirm = () => {
    setLoading(true);
    deleteRecord({
      baseId,
      tableName,
      id: data[primaryKey]
    }, {
      originalPath: pathname,
    })
    .then((result) => {
      if (result?.error) {
        throw new Error(result?.error)
      }
    })
    .catch(e => {
      toast.error("Uh oh! Something went wrong.", {
        description: e.message,
      });
    })
    .finally(() => {
      setOpen(false);
      setLoading(false);
    });
  };

  const handleTouchWebhook = (action: WebhookSchemaType) => {
    toast.promise(touchWebhook({
      baseId: baseId,
      tableName: tableName,
      webhookId: action.id,
      params: {
        recordIds: [data[primaryKey]],
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

  if (actionsDisabled) {
    return null;
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="h-4 w-4">
            <MoreHorizontal className="h-4 w-4 cursor-pointer hidden group-hover:block" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            className="gap-2"
            onClick={() => router.push(`/bases/${meta.baseId}/tables/${meta.tableName}/${data[primaryKey]}`)}
          >
            <Maximize2Icon className="h-4 w-4" /> {t('full_page')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => openDetailModal({
              baseId: meta.baseId,
              tableName: tableName,
              recordId: data[primaryKey],
            })}
          >
            <SquareSquareIcon className="h-4 w-4" /> {t('center_peek')}
          </DropdownMenuItem>
          {/* <DropdownMenuItem
            onClick={() => router.push(`/dashboard/user/${data[primaryKey]}`)}
          >
            <CopyIcon className="mr-2 h-4 w-4" /> {t('duplicate')}
          </DropdownMenuItem> */}

          <DropdownMenuItem className="text-red-500" onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4 text-red-500" /> {t('delete')}
          </DropdownMenuItem>
          {(actions.length > 0) && <DropdownMenuSeparator />}
          {actions.map((action) => {
            return <DropdownMenuItem key={action.id} onClick={() => handleTouchWebhook(action)}>
              <Settings2 className="mr-2 h-4 w-4"/> {action.label}
            </DropdownMenuItem>
          })}
          
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
