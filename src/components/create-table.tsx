'use client';

import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import ButtonLoading from "./button-loading";
import { createTable } from "@/actions/table";
import snakeCase from "lodash/snakeCase";
import { useTranslations } from "next-intl";

export default function CreateTable({ baseId, children }: {
  baseId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [tableLabel, setTableLabel] = useState('');
  const [tableName, setTableName] = useState('');
  const t = useTranslations('CreateTable');
  
  const handleCreateTable = () => {
    if (loading) return;
    setLoading(true);
    createTable({
      baseId: baseId,
      label: tableLabel,
      name: tableName,
    }, {
      originalPath: pathname,
    }).then((result) => {
      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Table created', {
        description: 'Table created successfully',
      });
      setOpen(false);
    }).catch(e => {
      toast.error('Table create failed', {
        description: e.message,
      });
    }).finally(() => setLoading(false));
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{t('modal_title')}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">
            {t('label')}
          </Label>
          <Input
            id="name"
            placeholder={t('label_placeholder')}
            className="col-span-3 h-8"
            onChange={e => setTableLabel(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">
            {t('name')}
          </Label>
          <Input
            id="name"
            placeholder={tableName ? tableName : tableLabel ? snakeCase(tableLabel) : t("name_placeholder")}
            className="col-span-3 h-8"
            onChange={e => setTableName(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant={'secondary'} className="h-8 px-3" onClick={() => setOpen(false)}>
          {t('cancel')}
        </Button>
        <Button className="h-8 px-3" disabled={loading} onClick={handleCreateTable}>
          <ButtonLoading loading={loading} />
          {t('create')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}