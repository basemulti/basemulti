'use client';

import { LayoutTemplateIcon, PanelTopIcon, UnplugIcon } from "lucide-react";
import { useParams } from "next/navigation";
import Connection from "@/components/base-settings/connection";
import { useState } from "react";
import Tabs from "./tabs";
import { useRouter } from "next-nprogress-bar";
import { createScratchBase } from "@/actions/base";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import ButtonLoading from "../button-loading";
import { useTranslations } from "next-intl";

export default function CreateBase() {
  const [externalData, setExternalData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [baseLabel, setBaseLabel] = useState('');
  const router = useRouter();
  const { workspaceId }: {
    workspaceId: string;
  } = useParams();
  const t = useTranslations('CreateBase');

  const handleCreateScratchBase = () => {
    if (loading) return;
    setLoading(true);
    createScratchBase({
      workspace_id: workspaceId,
      label: baseLabel,
    }).then((result) => {
      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Base created', {
        description: 'Base created successfully',
      });
      setOpen(false);
      router.push(`/workspaces/${workspaceId}`);
    }).catch(e => {
      toast.error('Base create failed', {
        description: e.message,
      });
    }).finally(() => setLoading(false));
  }

  return <>
    <Tabs showBasesButton={true} />
    {!externalData
    ? <div className="h-4/5 flex items-center justify-center">
      <div className="grid grid-cols-3 gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div className="w-52 flex flex-col items-center gap-4 rounded-lg hover:shadow border border-border px-4 py-5 cursor-pointer">
              <PanelTopIcon className="size-16" />
              <div className="flex flex-col items-center">
                <div className="font-bold text-center">{t('scratch_title')}</div>
                <span className="text-xs text-center">{t('scratch_description')}</span>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('modal_title')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  {t('modal_label')}
                </Label>
                <Input
                  id="name"
                  placeholder={t('modal_label_placeholder')}
                  className="col-span-3"
                  onChange={e => setBaseLabel(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant={'secondary'} className="h-8 px-3" onClick={() => setOpen(false)}>
                {t('modal_cancel')}
              </Button>
              <Button className="h-8 px-3" disabled={loading} onClick={handleCreateScratchBase}>
                <ButtonLoading loading={loading} />
                {t('modal_create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="w-52 flex flex-col items-center gap-4 rounded-lg hover:shadow border border-border px-4 py-5 cursor-not-allowed opacity-60">
          <LayoutTemplateIcon className="size-16" />
          <div className="flex flex-col items-center">
            <div className="font-bold text-center">{t('template_title')}</div>
            <span className="text-xs text-center">{t('template_description')}</span>
          </div>
        </div>
        <div className="w-52 flex flex-col items-center gap-4 rounded-lg hover:shadow border border-border px-4 py-5 cursor-pointer" onClick={() => setExternalData(true)}>
          <UnplugIcon className="size-16" />
          <div className="flex flex-col items-center">
            <div className="font-bold text-center">{t('external_title')}</div>
            <span className="text-xs text-center">{t('external_description')}</span>
          </div>
        </div>
      </div>
    </div>
    : <Connection
      workspaceId={workspaceId}
      label={''}
      provider={'mysql'}
      connection={{
        host: '',
        port: 3306,
        database: '',
        user: '',
        password: '',
        parameters: [],
      }}
      isEdit={false}
      onBack={() => setExternalData(false)}
      onSubmit={() => {
        router.push(`/workspaces/${workspaceId}`);
      }}
    />}
  </>
}