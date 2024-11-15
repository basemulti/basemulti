import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ModelDetailGrid({
  ui,
  value,
  row,
}: {
  ui: any;
  value: any;
  row: any;
}) {
  const { baseId }: {
    baseId: string;
  } = useParams();

  // return useMemo(() => {
    switch (ui?.type) {
      case 'email':
        return <a
          href={`mailto:${value}`}
          target="_blank"
          className="text-indigo-500 hover:underline"
        >
          {value}
        </a>;
      case 'link':
        return <Link
          href={value}
          target="_blank"
          className="text-indigo-500 hover:underline"
        >
          {value}
        </Link>;
      case 'image':
        if (!value) return <div style={{
          maxWidth: ui?.width,
          maxHeight: ui?.height,
        }}></div>;
        const src = ui.url ? ui.url.replace('{value}', value) : value;
        return <Dialog>
          <DialogTrigger asChild>
            <img className="cursor-pointer rounded" style={{
              maxWidth: ui?.width,
              maxHeight: ui?.height,
            }} src={src} />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <img className="" src={src} />
          </DialogContent>
        </Dialog>
      case 'select':
        if (ui.relation) {
          return <Link
            href={`/bases/${baseId}/tables/${ui.table}/${row?.[ui.name]?.[ui.primary_key || 'id']}`}
            className="text-indigo-500 font-semibold"
          >
            {row?.[ui.name]?.[ui.title]}
          </Link> || value;
        }

        return ui?.enum?.find((option: { label: string, value: any }) => option.value == value)?.label || value;
      case 'radio':
        return ui?.enum?.find((option: { label: string, value: any }) => option.value == value)?.label || value;
      case 'switch':
        return value
          ? <Check className="p-1 rounded-full bg-green-100 w-5 h-5 text-green-600" strokeWidth="3" />
          : <X className="p-1 rounded-full w-5 h-5 bg-gray-100 text-gray-500" strokeWidth="3" />;
      case 'datetime':
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
      default:
        return value;
    }
  // }, [cell.getValue(), ui?.type]);
}