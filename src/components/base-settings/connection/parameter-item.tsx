import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "lucide-react";

export function ParameterItem({ onKeyChange, onValueChange, onDelete, data }: any) {
  return (
    <div className="w-full grid grid-cols-2 gap-4">
      <Input className="h-8" type="text" placeholder="Parameter key" value={data.key} onChange={(e) => onKeyChange(e.target.value)} />
      <div className="flex items-center gap-2">
        <Input className="flex-1 h-8" type="text" placeholder="Parameter value" value={data.value} onChange={(e) => onValueChange(e.target.value)} />
        <Button type="button" variant={'outline'}  className="w-8 h-8 p-0" onClick={onDelete}>
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}