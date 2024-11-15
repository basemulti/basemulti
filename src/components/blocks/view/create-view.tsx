'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CircleAlertIcon, Grid3x3Icon, LayoutGridIcon, PlusIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import ButtonLoading from "@/components/button-loading"
import { useState } from "react"
import { createView } from "@/actions/view"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { useGlobalStore } from "@/store/global"
import { useTranslations } from "next-intl"

export default function CreateView() {
  const [loading, setLoading] = useState(false);
  const { baseId, tableName: paramTableName }: {
    baseId: string;
    tableName: string;
  } = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const [labelName, setLabelName] = useState('');
  const denies = useGlobalStore(store => store.denies);
  const t = useTranslations('ViewBar.CreateView');
  
  const handleCreatView = async () => {
    if (loading) {
      return ;
    }

    if (labelName === '') {
      toast.error("Uh oh! Something went wrong.", {
        description: 'Label is required'
      });
      return ;
    }

    setLoading(true);
    await createView({
      baseId: baseId,
      tableName: tableName,
      label: labelName,
    });

    setLoading(false);
  }

  if (denies(baseId, 'base', 'view:create')) {
    return null;
  }

  return <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="shadow-none p-1 rounded-md cursor-pointer h-auto">
        <PlusIcon className="size-5" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-60 p-0" align="start">
      <div className="flex fle-row items-center gap-3 bg-slate-100 py-2 px-4">
        <LayoutGridIcon className="size-4 text-slate-500" />
        <div className="text-[11px] text-slate-500 flex-1">{t('Grid.description')}</div>
      </div>
      <Separator />
      <div className="grid grid-cols-3 items-center gap-4 px-4 py-2">
        <Label htmlFor="label">{t('label')}</Label>
        <Input
          id="label"
          defaultValue=""
          placeholder={t('placeholder')}
          className="col-span-2 h-auto"
          onChange={(e) => setLabelName(e.target.value)}
        />
      </div>
      <Separator />
      <div className="w-full flex justify-end px-4 py-2">
        <Button className="px-2 py-1 text-sm h-auto" disabled={loading} onClick={handleCreatView}>
          <ButtonLoading loading={loading} />
          {t('create')}
        </Button>
      </div>
    </PopoverContent>
  </Popover>
}