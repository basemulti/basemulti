import { cn } from "@/lib/utils";
import { TableIcon } from "lucide-react";
import { FieldIcon } from "@/components/field-types";

type TableItemProps = {
  name: string;
  baseId: string;
  table: any;
}

export interface TableDragData {
  type: "Table";
  table: any;
}

export default function TableItem({
  name,
  baseId,
  table,
}: TableItemProps) {
  
  return <div
    className={cn(
      "flex flex-col px-4 py-2  rounded-md border border-border gap-3",
      table._status === 'added' && "border-green-300 bg-green-50",
      table._status === 'removed' && "border-red-300 bg-red-50",
      // table._status === "modified" && "border-yellow-300 bg-yellow-50",
    )}
  >
    <div className="flex flex-row items-center gap-2 text-sm">
      <div className="size-6 flex justify-center items-center"><TableIcon strokeWidth={'1.75px'} className="size-4" /></div>
      {name}
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(table?.fields || {}).map(([fieldName, field]: any) => <div
        key={fieldName}
        className={cn(
          "flex items-center gap-1 text-sm rounded-md border border-border px-2 py-0.5 hover:bg-muted",
          (field._status === 'added' || table._status === 'added') && "border-green-300 bg-green-50",
          (field._status === 'removed' || table._status === 'removed') && "border-red-300 bg-red-50",
          (field._status === "modified") && "border-yellow-300 bg-yellow-50",
        )}
      >
        <FieldIcon type={field.type} />
        {fieldName}
      </div>)}
    </div>
  </div>
}