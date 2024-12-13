'use client';

import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { KeyIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateToken from "./create-token";
import TokenItem from "./token-item";
import { useQuery } from "@tanstack/react-query";
import { getTokens } from "@/actions/token";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Loading from "../loading";

export default function Tokens() {
  const t = useTranslations('ModalAccount.Tokens');
  const { data: tokens, refetch, isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => (await getTokens() as { id: string, name: string, token: string }[]),
  });

  return <>
    <div className="flex-1 flex flex-col">
      <div className="text-base font-medium">{t('title')}</div>
      <Separator className="mt-3 mb-4" />
      <div className="flex-1 w-full flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <div className="relative">
          </div>
          <div className="flex items-center gap-2">
            <CreateToken onCreate={refetch}>
              <Button className={'h-8 gap-2'} disabled={tokens && tokens?.length > 0}>
                <PlusIcon className="size-4" />
                {t('create')}
              </Button>
            </CreateToken>
          </div>
        </div>
        <div className="size-full flex-1">
          <div className="size-full flex-1 flex flex-row">
            <div className="flex-1">
              {isLoading 
              ? <Loading />
              : tokens && tokens?.length > 0
              ? <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/5">{t('name')}</TableHead>
                    <TableHead className="w-3/5">{t('token')}</TableHead>
                    <TableHead className="w-1/5 text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens?.map((item: any) => {
                    return <TokenItem
                      key={item.id}
                      token={item}
                      onDelete={refetch}
                    />;
                  })}
                </TableBody>
              </Table>
              : <div className={cn(
                'size-full flex flex-col items-center justify-center gap-4',
              )}>
                <div className="bg-muted rounded-md p-2">
                  <KeyIcon className="size-8 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-center font-semibold">{t('no_tokens')}</div>
                  <div className="text-gray-500 text-sm text-center">{t('no_tokens_description')}</div>
                </div>
                <CreateToken onCreate={refetch}>
                  <Button className={'h-8 gap-2'}>
                    <PlusIcon className="size-4" />
                    {t('create')}
                  </Button>
                </CreateToken>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}