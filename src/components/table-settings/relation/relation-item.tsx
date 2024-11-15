import { cn } from "@/lib/utils";
import { GripVerticalIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import startCase from "lodash/startCase";

type RelationItemProps = {
  name: string;
  relation: any;
  isSelected: boolean;
  isOverlay?: boolean;
  onClick: (name: string) => void;
}

export interface RelationDragData {
  type: "Relation";
  relation: any;
}

export default function RelationItem({
  name,
  relation,
  isSelected,
  isOverlay,
  onClick,
}: RelationItemProps) {
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
      type: "Relation",
      relation,
    } satisfies RelationDragData,
    attributes: {
      roleDescription: "Relation",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };
  
  return <div
    ref={setNodeRef}
    className={cn(
      "flex items-center justify-between pr-4 py-2 cursor-pointer hover:bg-muted",
      isSelected && 'bg-muted',
      isOverlay ? "ring-1 ring-primary" : isDragging ? "ring-1 opacity-50" : undefined,
    )}
    style={style}
    onClick={() => onClick(name)}
  >
    <div className="flex flex-row items-center gap-2 text-sm">
      <div
        className="pl-4"
        {...attributes}
        {...listeners}
      >
      <GripVerticalIcon
        className="size-4 cursor-move"
      />
      </div>
      {/* <FieldIcon type={field?.ui?.type ?? 'string'} /> */}
      {relation?.label ?? startCase(name)}
      <span className="text-xs text-gray-500">{name}</span>
    </div>
  </div>
}