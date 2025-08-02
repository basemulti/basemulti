'use client';

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

export const name = 'd1';
export const label = 'D1';

export const defaultValues = {
  accountId: '',
  databaseId: '',
  apiToken: '',
}

export function Icon({ className }: IconProps) {
  return <img alt="Icon" className={cn("size-5", className)} src="/d1.svg" />;
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
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>Account ID</FormLabel>
                <FormControl>
                  <Input className="h-8" type="text" placeholder="e.g. 1234567890" {...field} value={field.value} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="databaseId"
          render={({ field }) => (
            <FormItem>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>Database ID</FormLabel>
                <FormControl>
                  <Input className="h-8" type="text" placeholder="e.g. 1234567890" {...field} value={field.value} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="apiToken"
          render={({ field }) => (
            <FormItem>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>API Token</FormLabel>
                <FormControl>
                  <Input className="h-8" type="password" placeholder="e.g. abcdefghijklmnopqrstuvwxyz" {...field} value={field.value} />
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