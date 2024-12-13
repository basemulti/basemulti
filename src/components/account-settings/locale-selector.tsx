'use client';

import { Button } from "@/components/ui/button";
import { CheckIcon, GlobeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/actions/locale";
import { Locale } from '@/i18n/config';
import ButtonLoading from "../button-loading";

const languages = [
  { label: "English", value: "en" },
  { label: "简体中文", value: "zh-CN" },
  // { label: "French", value: "fr" },
  // { label: "German", value: "de" },
  // { label: "Spanish", value: "es" },
  // { label: "Portuguese", value: "pt" },
  // { label: "Russian", value: "ru" },
  // { label: "Japanese", value: "ja" },
  // { label: "Korean", value: "ko" },
] as const;

export default function LocaleSelector({ type = 'button', align }: {
  type?: "icon" | "button";
  align?: "start" | "end" | "center";
}) {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setLocale(locale);
    });
  }

  return <Popover>
    <PopoverTrigger asChild>
      {type === 'button'
      ? <Button
        variant="outline"
        role="combobox"
        className={cn(
          "justify-between h-8 px-3 w-[120px]",
        )}
      >
        {locale
          ? languages.find(
              (language) => language.value === locale
            )?.label
          : "Select language"}
        {isPending
          ? <ButtonLoading loading={true} className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          : <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
      </Button>
      : <Button variant={'ghost'} className="w-8 h-8 p-0">
        <GlobeIcon className="h-4 w-4" />
      </Button>
      }
    </PopoverTrigger>
    <PopoverContent align={align} className="p-0 w-[120px]">
      <Command>
        <CommandInput
          placeholder="Search"
          className="h-9"
        />
        <CommandList>
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            {languages.map((language) => (
              <CommandItem
                value={language.label}
                key={language.value}
                className="cursor-pointer"
                onSelect={() => {
                  onChange(language.value)
                }}
              >
                {language.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    language.value === locale
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
}