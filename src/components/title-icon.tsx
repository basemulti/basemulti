import { cn } from "@/lib/utils";
import {
  ArrowUpRightIcon,
  AtSignIcon,
  BaselineIcon,
  CalendarClockIcon,
  CalendarIcon,
  CircleChevronDownIcon,
  Hash,
  LinkIcon,
  PaperclipIcon,
  SquareCheckIcon,
  TextIcon,
  TextQuoteIcon
} from "lucide-react";

type TitleIconProps = {
  ui: any;
  className?: string;
}

export default function TitleIcon({ ui, className: classNameProps }: TitleIconProps) {
  const className = cn("w-[14px] h-[14px]", classNameProps);

  switch (ui?.type) {
    case 'string':
      return <BaselineIcon className={className} />;
    case 'number':
      return <Hash className={className} />;
    case 'textarea':
      return <TextIcon className={className} />;
    case 'markdown':
      return <TextQuoteIcon className={className} />;
    case 'link':
      return <LinkIcon className={className} />;
    case 'date':
      return <CalendarIcon className={className} />;
    case 'datetime':
      return <CalendarClockIcon className={className} />;
    case 'image':
    case 'file':
      return <PaperclipIcon className={className} />;
    case 'switch':
      return <SquareCheckIcon className={className} />;
    case 'email':
      return <AtSignIcon className={className} />;
    case 'select':
      return ui.relation 
        ? <ArrowUpRightIcon className={className} />
        : <CircleChevronDownIcon className={className} />;
    default:
      return <Hash className={className} />;
  }
}