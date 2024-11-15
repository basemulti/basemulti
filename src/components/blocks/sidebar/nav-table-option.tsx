'use client';

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisIcon, EyeIcon, EyeOffIcon, LinkIcon, SettingsIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next-nprogress-bar";
import { deleteTable, setTableDisplay } from "@/actions/table";
import { useParams } from "next/navigation";
import { useGlobalStore } from "@/store/global";
import { toast } from "sonner";
import { useSchemaStore } from "@/store/base";
import TableIconSelector from "@/components/table-icon-selector";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import { AlertModal } from "@/components/modal/alert-modal";

export default function NavTableOption({ data }: { data: any; }) {
  const { baseId }: {
    baseId: string;
  } = useParams();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const allows = useGlobalStore(store => store.allows);
  const schema = useSchemaStore(store => store.schema);
  const t = useTranslations('BaseSidebar.TableActions');

  const handleChangeDisplay = async (e: any) => {
    e.preventDefault();
    setOpen(false);
    if (loading) return;
    setLoading(true);
    // if (visible === false) {
    //   schema.set(`tables.${table}.ui:display`, false);
    // } else {
    //   schema.set(`tables.${table}.ui:display`, undefined);
    // }
    await setTableDisplay({
      baseId: baseId,
      tableName: data.value,
      visible: !data.visible
    });
    setLoading(false);
  }

  const handleDelete = () => {
    setOpen(false);
    if (deleting) return;
    setDeleting(true);
    deleteTable({ baseId: baseId, tableName: data.value })
      .then(result => {
        if (result?.error) {
          throw new Error(result.error);
        }
        setDeleteOpen(true);
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setDeleting(false);
      });
  }

  return <>
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {/* <div className={cn(
          "size-6 flex items-center justify-center rounded-md hover:bg-gray-200 cursor-pointer",
          open && 'bg-gray-200'
        )}>
          <EllipsisIcon className={cn(
            "size-4 text-transparent group-hover:text-black",
            open && 'text-black'
          )} />
        </div> */}
        <SidebarMenuAction showOnHover>
          <EllipsisIcon />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel className="flex items-center gap-2">
          <TableIconSelector size={'sm'} baseId={baseId} tableName={data.value} selector={false} />
          {data.label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* <DropdownMenuItem className="cursor-pointer gap-2">
            <StarIcon className="size-4" />
            Add to Favorites
          </DropdownMenuItem>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            navigator.clipboard.writeText(`${window.location.origin}/bases/${baseId}/tables/${data.value}`);
            toast.success('Copied to clipboard');
          }}>
            <LinkIcon className="size-4" />
            {t('copy_link')}
          </DropdownMenuItem>
          {allows(baseId, 'base', 'table:update') && <DropdownMenuItem className="cursor-pointer gap-2" onClick={handleChangeDisplay}>
            {data.visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            {t(data.visible ? 'hide_table' : 'show_table')}
          </DropdownMenuItem>}
          {allows(baseId, 'base', 'table:update') && <DropdownMenuItem className="cursor-pointer gap-2" onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            router.push(`${data.href}/settings/field`);
          }}>
            <SettingsIcon className="size-4" />
            {t('table_settings')}
          </DropdownMenuItem>}
          {(allows(baseId, 'base', 'table:delete') && schema?.isDefaultProvider()) && <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2 text-red-600" onClick={() => setDeleteOpen(true)}>
              <TrashIcon className="size-4" />
              {t('delete')}
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </>}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <AlertModal
      isOpen={deleteOpen}
      onClose={() => setDeleteOpen(false)}
      onConfirm={handleDelete}
      loading={deleting}
    />
  </>
}