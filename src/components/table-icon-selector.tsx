'use client';

import { Button } from "@/components/ui/button";
import { TableIcon } from "lucide-react";
import { toast } from "sonner";
import data from '@emoji-mart/data/sets/15/twitter.json';
import Picker from '@emoji-mart/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateTableIcon } from "@/actions/table";
import { useSchemaStore } from "@/store/base";
import SchemaBuilder from "@/lib/schema-builder";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/store/global";

const sizeMap = {
  sm: {
    emoji: 'text-base',
    icon: 'size-4',
  },
  base: {
    emoji: 'text-xl',
    icon: 'size-5',
  }
}

export default function TableIconSelector({ baseId, tableName, icon, className, selector = true, size = 'base' }: {
  baseId: string;
  tableName: string;
  icon?: string | undefined;
  size?: 'sm' | 'base';
  className?: string;
  selector?: boolean;
}) {
  const { schema, setSchema } = useSchemaStore((state) => ({
    schema: state.schema,
    setSchema: state.setSchema,
  }));
  const { denies } = useGlobalStore((state) => ({
    denies: state.denies,
  }));

  if (!tableName) {
    return null;
  }

  if (schema?.schema.id !== baseId || !schema) {
    return <div className="w-6 h-6 flex items-center justify-center -m-1">
      {icon
        ? <div className={sizeMap[size].emoji}>{icon}</div>
        : <TableIcon strokeWidth={'1.75px'} className={cn(sizeMap[size].icon)} />}
    </div>
  }

  if (!schema.hasTable(tableName)) {
    return null;
  }

  const tableSchema = schema?.getTableSchema(tableName);

  const handleUpdateIcon = (emoji: any) => {
    const oldIcon = tableSchema?.icon;
    schema?.set(`tables.${tableName}.icon`, emoji.native);
    setSchema(schema as SchemaBuilder);

    updateTableIcon({
      baseId: baseId,
      tableName: tableName,
      icon: emoji.native,
      type: 'emoji',
    }).then(result => {
      if (result?.error) {
        throw new Error(result?.error);
      }
    }).catch((e) => {
      toast.error(e.message);
      schema?.set(`tables.${tableName}.icon`, oldIcon);
      setSchema(schema as SchemaBuilder);
    })
  }

  if (!selector || denies(baseId, 'base', 'table:update')) {
    return <div className="w-6 h-6 flex items-center justify-center -m-1">
      {tableSchema?.icon
        ? <div className={sizeMap[size].emoji}>{tableSchema?.icon}</div>
        : <TableIcon strokeWidth={'1.75px'} className={cn(sizeMap[size].icon)} />}
    </div>
  }

  return <Popover>
    <PopoverTrigger asChild>
      <Button variant={'ghost'} className="p-0 w-7 h-7 -m-1">
        {tableSchema?.icon ? <div className={sizeMap[size].emoji}>{tableSchema?.icon}</div> : <TableIcon strokeWidth={'1.75px'} className={cn(sizeMap[size].icon)} />}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="p-0 w-auto">
      <Picker
        data={data}
        previewPosition={'none'}
        navPosition={'none'}
        onEmojiSelect={handleUpdateIcon}
      />
    </PopoverContent>
  </Popover>;
}