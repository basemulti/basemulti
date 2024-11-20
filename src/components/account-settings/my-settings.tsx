'use client';

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import LocaleSelector from "./locale-selector";
import { useTranslations } from "next-intl";
import ThemeSelector from "./theme-selector";

export default function MySettings() {
  const t = useTranslations('ModalAccount.MySettings');

  return <>
    <div className="flex flex-col">
      <div className="text-base font-medium">{t('title')}</div>
      <Separator className="mt-3 mb-4" />
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="grid w-3/5 items-center gap-1.5">
            <Label>{t('appearance')}</Label>
            <div className="text-sm text-muted-foreground">{t('appearance_description')}</div>
          </div>
          <ThemeSelector />
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="grid w-3/5 items-center gap-1.5">
            <Label>{t('language')}</Label>
            <div className="text-sm text-muted-foreground">{t('language_description')}</div>
          </div>
          <LocaleSelector />
        </div>
      </div>
    </div>
  </>
}