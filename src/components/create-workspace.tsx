'use client';

import { createWorkspace } from "@/actions/workspace";
import ButtonLoading from "./button-loading";
import { Button } from "./ui/button";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export default function CreateWorkspace() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [labelName, setLabelName] = useState('');
  const t = useTranslations('AllWorkspaces.CreateWorkspace');

  const handleCreateWorkspace = () => {
    setLoading(true);
    createWorkspace({
      label: labelName,
    })
    .then((result) => {
      if (result.error) {
        throw new Error(result.error);
      }
      setOpen(false);
      setLabelName('');
    })
    .catch(e => {
      toast.error(e.message);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button className="text-sm h-8 px-3">
        {t('text')}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-60 p-0" align="end">
      <div className="grid grid-cols-3 items-center gap-4 px-4 py-2">
        <Label htmlFor="label">{t('label')}</Label>
        <Input
          id="label"
          defaultValue=""
          placeholder="Pedro Duarte"
          className="col-span-2 h-auto"
          onChange={(e) => setLabelName(e.target.value)}
        />
      </div>
      <Separator />
      <div className="w-full flex justify-end px-4 py-2">
        <Button className="px-2 py-1 text-sm h-auto" disabled={loading} onClick={handleCreateWorkspace}>
          <ButtonLoading loading={loading} />
          {t('create')}
        </Button>
      </div>
    </PopoverContent>
  </Popover>
}