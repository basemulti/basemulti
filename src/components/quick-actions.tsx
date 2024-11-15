'use client';

import { ArrowUpDownIcon, CornerDownLeftIcon, LayoutGridIcon, SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSchemaStore } from "@/store/base";
import { useParams } from "next/navigation";
import startCase from "lodash/startCase";
import { useRouter } from "next-nprogress-bar";
import { DialogFooter } from "./ui/dialog";
import TableIconSelector from "./table-icon-selector";
import { useTranslations } from "next-intl";

const DEFAULT_COUNT = 5;

type CommandData = {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  keywords: string[];
  group: string;
  action: () => void;
}

export default function QuickActions() {
  const { baseId }: {
    baseId: string;
  } = useParams();
  const t = useTranslations('QuickActions');

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { schema } = useSchemaStore();
  const router = useRouter();

  const allCommands = useMemo(() => {
    const commands: any[] = [];
    if (!schema) {
      return commands;
    }

    const tables = schema?.getTables();

    if (!tables) {
      return commands;
    }

    Object.entries(tables).forEach(([table, tableSchema]) => {
      commands.push({
        id: table,
        label: tableSchema?.label || startCase(table),
        description: table,
        icon: <TableIconSelector size="sm" baseId={baseId} tableName={table} selector={false} />,
        keywords: [tableSchema?.label, table].filter(i => typeof i === 'string'),
        group: t('tables'),
        action: () => {
          setOpen(false);
          router.push(`/bases/${baseId}/tables/${table}`);
        }
      });

      const views = schema.getViews(table);
      if (!views) {
        return;
      }

      Object.entries(views).forEach(([view, viewSchema]) => {
        commands.push({
          id: view,
          label: viewSchema?.label,
          description: tableSchema?.label || startCase(table),
          icon: <div className="w-6 h-6 flex justify-center items-center"><LayoutGridIcon className="size-4" /></div>,
          keywords: [viewSchema?.label, tableSchema?.label, table].filter(i => typeof i === 'string'),
          group: t('views'),
          action: () => {
            setOpen(false);
            router.push(`/bases/${baseId}/tables/${table}?tab=${view}`);
          }
        });
      });
    });

    return commands;

  }, [schema]);

  const filteredCommands: Record<string, CommandData[]> = useMemo(() => {
    const filtered = allCommands.filter((command) =>
      command.label?.toLowerCase()?.includes(search.toLowerCase()) ||
      command.keywords.some((keyword: string) => keyword?.toLowerCase()?.includes(search.toLowerCase()))
    )

    const grouped = filtered.reduce((acc, command) => {
      if (!acc[command.group]) {
        acc[command.group] = []
      }
      acc[command.group].push(command)
      return acc
    }, {} as Record<string, CommandData[]>)

    return grouped;
  }, [allCommands, search]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    }
 
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [])

  return <>
    <nav className="grid items-start gap-1 px-1">
      <Button variant={'outline'} className="h-8 shadow-none justify-between px-3 bg-background" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-2">
          <SearchIcon className="size-4" />
          {t('text')}
        </div>
        <span className="text-xs rounded border border-border px-1 py-0.5 bg-background">CTRLK</span>
      </Button>
    </nav>
    <CommandDialog open={open} onOpenChange={(open) => {
      setOpen(open);
      !open && setSearch('');
    }}>
      <CommandInput placeholder={t('placeholder')} onValueChange={setSearch} />
      <CommandList className="max-h-[calc(100vh-150px)] h-[450px]">
        <CommandEmpty>{t('empty')}</CommandEmpty>
        {Object.entries(filteredCommands).map(([group, commands]) => <CommandGroup key={group} heading={group}>
          {commands.slice(0, search.length > 0 ? commands.length : DEFAULT_COUNT).map((command: any, index) => <CommandItem key={`${command.id}`} className="h-8 gap-2 justify-between cursor-pointer" keywords={command.keywords} onSelect={command.action}>
            <div className="flex items-center gap-2">
              {command.icon}
              <span>{command.label}</span>
              {command.description && <span className="text-xs text-muted-foreground">{command.description}</span>}
            </div>
          </CommandItem>)}
        </CommandGroup>)}
      </CommandList>
      <DialogFooter className="border-t border-t-border px-4 py-2 gap-2 justify-start sm:justify-start bg-muted">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="p-1 border border-border rounded">
            <ArrowUpDownIcon className="size-3 text-muted-foreground" />
          </div>
          {t('select')}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="p-1 border border-border rounded">
            <CornerDownLeftIcon className="size-3 text-muted-foreground" />
          </div>
          {t('open')}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="px-1 border border-border rounded h-[22px] flex items-center">
            esc
          </div>
          {t('close')}
        </div>
      </DialogFooter>
    </CommandDialog>
  </>;
}