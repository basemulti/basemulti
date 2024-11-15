'use client';

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

export const name = 'sqlite';
export const label = 'SQLite';

export const defaultValues = {
  filename: '',
}

export function Icon({ className }: IconProps) {
  return <img alt="Icon" className={cn("size-5", className)} src="/sqlite.svg" />;
}

export function ConnectionEditor({ title }: ConnectionEditorProps) {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col gap-2">
      <div className="font-medium mt-6 mb-2 flex items-center justify-between">
        {title}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="filename"
          render={({ field }) => (
            <FormItem>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>filename</FormLabel>
                <FormControl>
                  <Input className="h-8" type="text" placeholder="e.g. /foo/bar/sqlite.db" {...field} value={field.value} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}