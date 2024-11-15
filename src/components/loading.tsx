import ButtonLoading from "@/components/button-loading";
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations('Metadata');

  return <div className="flex items-center size-full justify-center">
    <ButtonLoading className="mr-2 size-4" loading={true} />
    {t('loading')}
  </div>
}