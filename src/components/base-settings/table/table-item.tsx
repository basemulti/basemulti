import { cn } from "@/lib/utils";
import { EditIcon, EyeIcon, GripVerticalIcon, ListIcon, TableIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Switch } from "@/components/ui/switch";
import { setTableDisplay, updateTableLabel } from "@/actions/table";
import { Button, buttonVariants } from "@/components/ui/button";
// @ts-ignore
import { useOptimistic, useRef, useState } from "react";
import AutoWidthInput from "@/components/auto-width-input";
import Link from "next/link";
import { toast } from "sonner";
import { useGlobalStore } from "@/store/global";
import TableIconSelector from "@/components/table-icon-selector";
import { useTranslations } from "next-intl";

type TableItemProps = {
  name: string;
  baseId: string;
  table: any;
  display: boolean;
  isOverlay?: boolean;
}

export interface TableDragData {
  type: "Table";
  table: any;
}

export default function TableItem({
  name,
  baseId,
  table,
  display,
  isOverlay,
}: TableItemProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: name,
    data: {
      type: "Table",
      table,
    } satisfies TableDragData,
    attributes: {
      roleDescription: "Table",
    },
  });
  const t = useTranslations('Base.Settings.Tables');

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const [optimisticDisplay, changeOptimisticDisplay] = useOptimistic(display, (state: any, value: boolean) => value);
  const [optimisticLabel, changeOptimisticLabel] = useOptimistic(table.label, (state: any, value: string) => value);
  const [renameing, setRenameing] = useState(false);
  const viewInputRef = useRef(null);
  const { denies } = useGlobalStore(store => ({
    denies: store.denies,
  }));

  const handleChangeVisible = async (value: boolean) => {
    changeOptimisticDisplay(value);
    await setTableDisplay({
      baseId: baseId,
      tableName: name,
      visible: value
    });
  }

  const handleUpdateTableLabel = async (oldName: string, newName: string) => {
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

    changeOptimisticLabel(newName);
    setRenameing(false);

    await updateTableLabel({
      baseId: baseId,
      tableName: name,
      label: newName
    });
  }
  
  return <div
    ref={setNodeRef}
    className={cn(
      "flex items-center justify-between pr-4 py-2 cursor-pointer hover:bg-muted",
      isOverlay ? "ring-1 ring-primary" : isDragging ? "ring-1 opacity-50" : undefined,
    )}
    style={style}
  >
    <div className="flex flex-row items-center gap-2 text-sm">
      <div
        className="pl-4"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon
          strokeWidth={'1.75px'}
          className="size-4 cursor-move"
        />
      </div>
      {/* <TableIcon strokeWidth={'1.75px'} className="size-4" /> */}
      <TableIconSelector size="sm" baseId={baseId} tableName={name} />
      {renameing ? <AutoWidthInput
        ref={viewInputRef}
        className="bg-transparent min-w-2 focus-visible:outline-none"
        defaultValue={optimisticLabel}
        autoSelect={true}
        onBlur={handleUpdateTableLabel}
      /> : optimisticLabel}
      <span className="text-xs text-gray-500">{name}</span>
    </div>
    <div className="flex items-center gap-4">
      <Button variant={'outline'} className="h-8 px-2 text-xs gap-2" onClick={() => setRenameing(true)}>
        <EditIcon className="size-4" />
        {t('rename')}
      </Button>
      <div className={cn(
        buttonVariants({ variant: "outline" }),
        "h-8 px-2 text-xs gap-2",
        denies(baseId, 'base', 'table:update') && 'opacity-50',
      )} onClick={() => {
        if (denies(baseId, 'base', 'table:update')) {
          return;
        }
        
        handleChangeVisible(! optimisticDisplay)
      }}>
        <EyeIcon className="size-4" />
        <Switch
          className="w-[26px] h-[14px]"
          buttonClassName="w-[10px] h-[10px] data-[state=checked]:translate-x-3"
          checked={optimisticDisplay !== false}
        />
      </div>
      <Link href={`/bases/${baseId}/tables/${name}/settings/field`} className={cn(buttonVariants({ variant: "outline" }), 'h-8 px-2 text-xs gap-2')}>
        <ListIcon className="size-4" />
        {t('fields')}
      </Link>
    </div>
  </div>
}