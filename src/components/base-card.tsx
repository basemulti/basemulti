import Link from "next/link";
import BaseIcon from "./base-icon";
import { Button } from "./ui/button";
import { CopyIcon, EditIcon, EllipsisIcon, StarIcon, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// @ts-ignore
import { useState, useRef, useEffect, useOptimistic } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { startProgress, stopProgress, useRouter } from "next-nprogress-bar";
import { duplicateBase, removeBase, updateBaseLabel } from "@/actions/base";
import { AlertModal } from "./modal/alert-modal";
import { toast } from "sonner";
import { useGlobalStore } from "@/store/global";
import { useTranslations } from "next-intl";

export default function BaseCard({ base }: {
  base: any;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [label, setLabel] = useState(base.label);
  const [optimisticLabel, setOptimisticLabel] = useOptimistic(label, (state: string, value: string) => value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [baseDeleting, setBaseDeleting] = useState(false);
  const router = useRouter();
  const { allows } = useGlobalStore(store => ({
    allows: store.allows,
  }));
  const t = useTranslations('BaseCard');

  const handleDeleteBase = () => {
    setBaseDeleting(true);
    removeBase({ id: base.id }).then((result) => {
      if (result?.error) {
        throw new Error(result?.error);
      }

      setDeleteOpen(false);
      router.refresh();
    }).catch((error) => toast.error(error.message)).finally(() => {
      setBaseDeleting(false);
    });
  }

  useEffect(() => {
    setTimeout(() => {
      if (renaming) {
        inputRef?.current?.focus();
      }
    }, 300);
    
  }, [renaming]);

  const handleBlurLabel = (e: any) => {
    e.preventDefault();

    const newLabel = e.target.value;

    if (newLabel === label) {
      setRenaming(false);
      return;
    }

    setOptimisticLabel(newLabel);
    updateBaseLabel({ id: base.id, label: newLabel }).then((result) => {
      if (result?.error) {
        throw new Error(result?.error);
      }
      
      setRenaming(false);
      setLabel(newLabel);
      router.refresh();
    }).catch((error) => {
      setOptimisticLabel(label);
      toast.error(error.message)
    }).finally(() => {
      setRenaming(false);
    });
  }

  const handleDuplicateBase = () => {
    startProgress();
    duplicateBase({ id: base.id }).catch((error) => {
      toast.error(error.message)
    }).finally(() => {
      router.refresh();
      stopProgress();
    })
  }

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dropdown-area')) {
      return;
    }
    router.push(`/bases/${base.id}`);
  };

  return (
    <>
      <div
        className="rounded-lg p-4 flex justify-between gap-3 shadow-sm hover:shadow border border-border bg-background group cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex gap-3 flex-auto overflow-hidden">
          <BaseIcon className="w-12 h-12 rounded-lg" textClassName="text-lg" label={label} />
          {renaming
          ? <Input
            ref={inputRef}
            defaultValue={optimisticLabel}
            className="h-8 focus-visible:ring-0"
            onBlur={handleBlurLabel}
            onKeyPress={handleKeyPress}
          />
          : <div className="text-sm truncate w-auto">{optimisticLabel}</div>}
        </div>
        <div className={cn(
          "dropdown-area",
          // "group-hover:block hidden",
          dropdownOpen && "block"
        )}>
          <div className="flex items-center h-auto gap-2">
            {/* <StarIcon className="size-4" /> */}
            {allows(base.id, 'base', [
              'base:update',
              'base:create',
              'base:delete',
            ], false) && <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant={'outline'} className="h-6 w-6 p-0">
                  <EllipsisIcon className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="">
                <DropdownMenuGroup>
                  {allows(base.id, 'base', 'base:update') && <DropdownMenuItem className="cursor-pointer gap-2 h-8 text-sm" onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setRenaming(true);
                  }}>
                    <EditIcon className="size-4" />
                    {t('rename')}
                  </DropdownMenuItem>}
                  {allows(base.id, 'base', 'base:create') && <DropdownMenuItem className="cursor-pointer gap-2 h-8 text-sm" onSelect={handleDuplicateBase}>
                    <CopyIcon className="size-4" />
                    {t('duplicate')}
                  </DropdownMenuItem>}
                  {allows(base.id, 'base', 'base:delete') && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 h-8 text-sm" onSelect={() => setDeleteOpen(true)}>
                      <Trash className="size-4" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </>}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>}
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteBase}
        loading={baseDeleting}
      />
    </>
  );
}