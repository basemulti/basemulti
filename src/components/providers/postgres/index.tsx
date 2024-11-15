'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EyeIcon, EyeOffIcon, PlusIcon, SparklesIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn, parseMySqlConnectionString } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ParameterItem } from "@/components/base-settings/connection/parameter-item";

export const name = 'postgres';
export const label = 'PostgreSQL';

export const defaultValues = {
  host: '',
  port: 5432,
  database: '',
  user: '',
  password: '',
  ssl: false,
  parameters: [],
}

export function connectionToFormValues(connection: any) {
  return {
    host: connection.host,
    port: connection.port ?? '',
    database: connection.database,
    user: connection.user,
    password: connection.password,
    ssl: connection.ssl,
    parameters: connection.parameters ? (Object.entries(connection.parameters as any).map(([key, value]) => ({
      key: key,
      value: value,
    })) ?? []) : [],
  }
}

export function Icon({ className }: IconProps) {
  return <img alt="Icon" className={cn("size-5", className)} src="/postgres.svg" />;
}

export function ConnectionEditor({ title }: ConnectionEditorProps) {
  const { control, setValue } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const [connectionUrl, setConnectionUrl] = useState('');

  const handleImportConnection = () => {
    if (connectionUrl.length === 0) {
      return;
    }

    const connectionObject = parseMySqlConnectionString(connectionUrl);
    if (connectionObject === null) {
      toast.error('Invalid connection string', {
        description: 'Please check your connection string',
      });
      return;
    }
    
    setValue('host', connectionObject.host);
    setValue('port', connectionObject.port ?? 5432);
    setValue('database', connectionObject.database);
    setValue('user', connectionObject.user);
    setValue('password', connectionObject.password);
    setValue('ssl', connectionObject.ssl);
    setValue('parameters', Object.entries(connectionObject.parameters as any).map(([key, value]) => ({
      key: key,
      value: value,
    })) ?? []);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="font-medium mt-6 mb-2 flex items-center justify-between">
        {title}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant={'secondary'} className="h-8 gap-2">
              <SparklesIcon className="size-4 text-yellow-400 fill-yellow-400" />
              Use Connection URL
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-42 p-0" align="end">
            <div className="flex fle-row items-center gap-3 bg-slate-100 py-2 px-4">
              <div className="text-sm text-slate-500 flex-1">Auto populate connection configuration using database connection URL</div>
            </div>
            <Separator />
            <div className="px-4 p-2">
              <Textarea
                className="h-32"
                placeholder={`postgres://`}
                value={connectionUrl}
                onChange={(e) => setConnectionUrl(e.target.value)}
              />
            </div>
            <Separator />
            <div className="w-full flex justify-end px-4 py-2">
              <Button type="button" className="px-3 py-1 text-sm h-auto" onClick={handleImportConnection}>
                Import
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="host"
          render={({ field }) => (
            <FormItem>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>Host address</FormLabel>
                <FormControl>
                  <Input className="h-8" type="text" placeholder="Host address" {...field} value={field.value} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="port"
          render={({ field }) => (
            <FormItem>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>Port number</FormLabel>
                <FormControl>
                  <Input className="h-8" type="text" placeholder="5432" {...field} value={field.value} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="user"
          render={({ field }) => (
            <FormItem>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input className="h-8" type="text" placeholder="Username" {...field} value={field.value} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>Password</FormLabel>
                <FormControl>
                <div className="flex items-center gap-2">
                  <Input className="h-8 flex-1" type={showPassword ? 'text' : "password"} placeholder="Password" {...field} value={field.value} />
                  <Button type="button" variant={'outline'} className="w-8 h-8 p-0" onClick={() => setShowPassword(! showPassword)}>
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </Button>
                </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="database"
          render={({ field }) => (
            <FormItem>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel>Database</FormLabel>
                <FormControl>
                  <Input className="h-8" type="text" placeholder="Database name" {...field} value={field.value} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="ssl"
        render={({ field }) => (
          <FormItem>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <FormLabel>Use SSL</FormLabel>
              <FormControl>
                <div className="h-8 flex items-center">
                  <Switch {...field} checked={field.value} onCheckedChange={(value) => {
                    field.onChange(value);
                  }} />
                </div>
              </FormControl>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="parameters"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-col items-start mt-2">
              <FormLabel>Connection parameters</FormLabel>
              <FormControl>
                <div className="w-full flex flex-col gap-2 mt-2">
                  {field.value?.map((param: { key: string, value: unknown }, i: number) => (
                    <ParameterItem
                      key={i}
                      data={param}
                      index={i}
                      onKeyChange={(value: string) => {
                        field.onChange(field.value.map((_: any, j: number) => j === i ? { ..._, key: value } : _));
                      }}
                      onValueChange={(value: string) => {
                        field.onChange(field.value.map((_: any, j: number) => j === i ? { ..._, value } : _));
                      }}
                      onDelete={() => {
                        field.onChange(field.value.filter((_: any, j: number) => j !== i));
                      }}
                    />
                  ))}
                  <Button type="button" variant={'outline'} className="px-2 h-8 gap-1 w-auto" onClick={() => {
                    field.onChange([...field.value, { key: '', value: '' }]);
                  }}>
                    <PlusIcon className="size-4" />
                    Add
                  </Button>
                </div>
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}