'use client';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretSortIcon } from "@radix-ui/react-icons";
import LocaleSelector from "./locale-selector";
import { useTranslations } from "next-intl";
import ThemeSelector from "./theme-selector";

const themes = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
] as const

const themeSelected = 'light';

export default function MySettings() {
  const t = useTranslations('ModalAccount.MySettings');

  return <>
    <div className="flex flex-col">
      <div className="text-base font-medium">{t('title')}</div>
      <Separator className="mt-3 mb-4" />
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="grid w-3/5 items-center gap-1.5">
            <Label>{t('appearance')}</Label>
            <div className="text-sm text-muted-foreground">{t('appearance_description')}</div>
          </div>
          <ThemeSelector />
          {/* <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "justify-between h-8 px-3 w-[120px]",
                )}
                disabled={true}
              >
                {themeSelected
                  ? themes.find(
                      (theme) => theme.value === themeSelected
                    )?.label
                  : "Select theme"}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[120px]">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {themes.map((theme) => (
                      <CommandItem
                        value={theme.label}
                        key={theme.value}
                        onSelect={() => {
                        }}
                      >
                        {theme.label}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            theme.value === themeSelected
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
          </Popover> */}
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="grid w-3/5 items-center gap-1.5">
            <Label>{t('language')}</Label>
            <div className="text-sm text-muted-foreground">{t('language_description')}</div>
          </div>
          <LocaleSelector />
        </div>
      </div>
    </div>
  </>
}