import { cn } from "@/lib/utils";
import { LoaderCircleIcon } from "lucide-react";

export default function ButtonLoading({ loading, className }: {
  loading: boolean;
  className?: string;
}) {
  return loading && <LoaderCircleIcon className={cn("mr-1 size-4 animate-spin", className)} />
}