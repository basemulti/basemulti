import { cn, getInitials } from "@/lib/utils";
import 'react-markdown-editor-lite/lib/index.css';
import { Avatar, AvatarFallback } from "../ui/avatar";
import { FormItem, FormLabel } from "../ui/form";
import { UserRoundPenIcon } from "lucide-react";

export const key = 'modifier';
export const label = 'Updated By';
export const isSystemField = true;

export function Icon({ className }: {
  className?: string;
}) {
  return <UserRoundPenIcon className={className} />;
}

export function Value({ row }: any) {
  if (!row?.modifier) {
    return null;
  }

  const userName = row?.modifier?.name;

  return (
    <span className="h-6 pr-2 border border-border border-l-0 rounded-full flex items-center gap-1 text-xs cursor-pointer w-fit">
      <Avatar className={cn("rounded-full border border-border w-6 h-6")}>
        <AvatarFallback className={cn("rounded-md font-medium")}>{getInitials(userName)}</AvatarFallback>
      </Avatar>
      {userName}
    </span>
  );
}

export function Editor({ name, schema, disabled, originalData }: any) {
  if (!originalData?.modifier) {
    return null;
  }

  const userName = originalData?.modifier?.name;

  return <FormItem className="space-y-0 flex flex-row items-center">
    <FormLabel className="w-1/5 flex flex-row items-center gap-2">
      <Icon className={'w-[14px] h-[14px]'} />
      {schema?.label}
    </FormLabel>
    <span className="h-6 pr-2 border border-border border-l-0 rounded-full flex items-center gap-1 text-xs cursor-pointer w-fit">
      <Avatar className={cn("rounded-full border border-border w-6 h-6")}>
        <AvatarFallback className={cn("rounded-md font-medium")}>{getInitials(userName)}</AvatarFallback>
      </Avatar>
      {userName}
    </span>
  </FormItem>;
}

export function TypeEditor() {
  return null;
}