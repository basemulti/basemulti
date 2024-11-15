import { LinkIcon } from "lucide-react";
import Link from "next/link";

export const key = 'url';
export const label = 'URL';

export function Icon({ className }: {
  className?: string;
}) {
  return <LinkIcon className={className} />;
}

export function Value({ value }: any) {
  return <Link
    href={String(value).startsWith('http') ? value : `https://${value}`}
    target="_blank"
    className="text-indigo-500 hover:underline"
  >
    {value}
  </Link>;
}