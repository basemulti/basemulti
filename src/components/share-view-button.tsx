import { CopyIcon, ExternalLinkIcon, EyeIcon, RefreshCwIcon, Share2Icon } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { createShare, deleteShare, getShare, updateShare } from "@/actions/share";
import { toast } from "sonner";
import ButtonLoading from "./button-loading";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ShareViewButton({ baseId, tableName, viewId }: {
  baseId: string;
  tableName: string;
  viewId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [share, setShare] = useState<any | null>(null);
  const t = useTranslations('ShareView');
  
  useEffect(() => {
    if (baseId && tableName && viewId) {
      getShare({
        baseId,
        tableName,
        viewId,
        type: 'view'
      }).then(result => {
        if (result?.error) {
          throw new Error(result?.error);
        }

        setOpen(result.share ? true : false);
        setShare(result.share);
      }).catch((e) => {})
    }
    
  }, [baseId, tableName, viewId]);

  const handleChangeSwitch = (value: boolean) => {
    if (loading) return;
    setLoading(true);

    if (value === true) {
      handleCreateShare();
    } else {
      handleRemoveShare();
    }
  }

  const handleCreateShare = () => {
    createShare({ baseId: baseId, tableName, viewId, type: 'view' })
      .then(result => {
        if (result?.error) {
          throw new Error(result?.error);
        }

        setShare(result.share);
        setOpen(true);
      })
      .catch(e => {
        toast.error(e.message);
      })
      .finally(() => setLoading(false));
  }

  const handleRemoveShare = () => {
    deleteShare({ baseId: baseId, tableName, viewId, type: 'view' })
      .then(result => {
        if (result?.error) {
          throw new Error(result?.error);
        }

        setShare(null);
        setOpen(false);
      })
      .catch(e => {
        toast.error(e.message);
      })
      .finally(() => setLoading(false));
  }

  const handleRefreshShare = () => {
    if (loading) return;
    setLoading(true);
    updateShare({ baseId: baseId, tableName, viewId, type: 'view' })
      .then(result => {
        if (result?.error) {
          throw new Error(result?.error);
        }

        setShare(result.share);
      })
      .catch(e => {
        toast.error(e.message);
      })
      .finally(() => setLoading(false));
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(share?.share_link);
    toast.success('Link copied');
  }

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(`<iframe src="${share?.share_link}" width="100%" height="650" style="border: 0"></iframe>`);
    toast.success('Embed copied');
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn('px-2 h-8 gap-2')}
        >
          <Share2Icon className="size-4" />
          {t('text')}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className={cn("p-0", open ? 'w-[450px]' : 'w-[300px]')}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2Icon className="size-4" />
            <div className="text-sm font-medium">{t('title')}</div>
          </div>
          <div className="flex items-center gap-1">
            <ButtonLoading loading={loading} />
            <Switch disabled={loading} checked={open} onCheckedChange={handleChangeSwitch} />
          </div>
        </div>
        {open && <>
          <Separator className="" />
          <div className="p-2 flex items-center gap-2">
            <Input className="flex-1 h-8 px-3" value={share?.share_link} />
            <Link
              href={share?.share_link}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                "p-0 w-8 h-8"
              )}
              target="_blank"
            >
              <ExternalLinkIcon className="size-4" />
            </Link>
            <Button variant={'outline'} className="p-0 w-8 h-8" onClick={handleCopyLink}>
              <CopyIcon className="size-4" />
            </Button>
            <Button variant={'outline'} className="p-0 w-8 h-8" onClick={handleRefreshShare}>
              <RefreshCwIcon className="size-4" />
            </Button>
          </div>
          <Separator className="" />
          <div className="p-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button variant={'outline'} className="p-0 w-8 h-8">
                <EyeIcon className="size-4" />
              </Button>
              <Button variant={'outline'} className="p-0 w-8 h-8" onClick={handleCopyEmbed}>
                <CopyIcon className="size-4" />
              </Button>
            </div>
            <div className="h-48">
              <Textarea className="size-full" value={`<iframe src="${share?.share_link}" width="100%" height="533" style="border: 0"></iframe>`} />
            </div>
          </div>
        </>}
      </PopoverContent>
    </Popover>
  );
}