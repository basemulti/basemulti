'use client';

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { cn, isSystemField } from "@/lib/utils";
import { FieldIcon, fieldTypes, getFieldType } from "../field-types";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

type FieldTypeSelectProps = {
  name: string;
  provider: string | undefined;
};

export default function FieldTypeSelector({ name, provider }: FieldTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const { setValue, getValues } = useFormContext();
  const t = useTranslations('Table.Settings.Fields.Editor');
  const fieldType = getValues('ui.type');
  const isDefaultProvider = provider === 'default';

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="type">{t('type')}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !fieldType && "text-muted-foreground"
            )}
            onClick={() => setOpen(!open)}
            disabled={isSystemField(name) && isDefaultProvider}
          >
            <div className="flex items-center gap-2">
              <FieldIcon type={fieldType} />
              {getFieldType(fieldType).label}
            </div>
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder={t('search_type_placeholder')}
              className="h-8"
            />
            <CommandList>
              <CommandEmpty>{t('search_type_empty')}</CommandEmpty>
              <CommandGroup>
                {Object.keys(fieldTypes).filter(
                  type => !fieldTypes[type].isSystemField
                ).map((type) => (
                  <CommandItem
                    className="flex items-center gap-2"
                    value={type}
                    key={type}
                    onSelect={() => {
                      setValue('ui', {
                        type,
                      }, {
                        shouldDirty: true
                      });
                      setOpen(false);
                    }}
                  >
                    <FieldIcon type={type} />
                    {fieldTypes[type].label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}