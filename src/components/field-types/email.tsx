import { AtSignIcon } from "lucide-react";

export const key = 'email';
export const label = 'Email';

export function Icon({ className }: {
  className?: string;
}) {
  return <AtSignIcon className={className} />;
}

export function Value({ value }: any) {
  return <a
    href={`mailto:${value}`}
    target="_blank"
    className="text-indigo-500 hover:underline"
  >
    {value}
  </a>;
}