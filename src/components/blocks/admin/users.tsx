'use client';

import { Input } from "@/components/ui/input";
import { MoreHorizontalIcon, SearchIcon } from "lucide-react";
import Pagination from "../pagination/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import dayjs from "dayjs";
import useTransitionProgress from "@/hooks/use-transition-progress";
import { parseAsInteger, useQueryState, useQueryStates } from "nuqs";
import { useCallback } from "react";
import { debounce } from "lodash";

export default function Users({
  data,
  defaultLimit = 10
}: {
  data: {
    current_page: number;
    total: number;
    count: number;
    data: any[];
    last_page: number;
  };
  defaultLimit?: number;
}) {
  const t = useTranslations('Admin.Users');
  const { startTransition } = useTransitionProgress();
  const [{ page, limit }, setPagination] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(defaultLimit),
  }, {
    shallow: false,
    startTransition: startTransition,
  });
  
  const [q, setQ] = useQueryState('q', {
    defaultValue: '',
    startTransition: startTransition,
  });

  const debounceFn = useCallback(debounce((value) => {
    setQ(value);
    
    setPagination({
      page: 1,
      limit: limit,
    })
  }, 500, {
    leading: false,
    trailing: true
  }), [q]);

  return (
    <div className="max-w-screen-lg mx-auto mt-4 w-full flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <div className="relative">
        <Input className="pl-8 h-8" placeholder={t('search_placeholder')} defaultValue={q} onChange={(e) => debounceFn(e.target.value)} />
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-4 text-gray-500" />
        </div>
      </div>
      <div className="size-full flex flex-row">
        <div className="h-[calc(100vh-200px)] flex-1 overflow-y-auto relative flex flex-col">
          <Table className="w-full">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-7/12">{t('name')}</TableHead>
                <TableHead className="w-2/12">{t('created_at')}</TableHead>
                <TableHead className="w-2/12">{t('status')}</TableHead>
                <TableHead className="w-1/12 text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <div className="flex-1 overflow-y-auto">
            <Table className="w-full">
              <TableBody>
                {data?.data?.map((item: any) => {
                  return <TableRow key={item.id} className="hover:bg-background">
                  <TableCell className="font-medium w-7/12 overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px] truncate">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 rounded-lg">
                        <AvatarImage src={item.avatar} />
                        <AvatarFallback className="text-base rounded-xl font-medium">{getInitials(item.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        {item.name}
                        <span className="text-xs text-muted-foreground">{item.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="w-2/12 cursor-pointer">
                    {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell className="w-2/12 cursor-pointer">
                    <div className="flex items-center gap-1">
                      {item.status === 0 ? <div className="w-2 h-2 rounded-full bg-red-500"></div> : <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                      {item.status === 0 ? '禁用' : '正常'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right w-1/12">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant={'ghost'} className="w-6 h-6 p-0">
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>;
                })}
              </TableBody>
            </Table>
          </div>
          <Pagination
            className="sticky bottom-0 bg-background z-10"
            page={page}
            onPageChange={(page) => setPagination({ page })}
            total={data.total}
            limit={limit}
            onLimitChange={(limit) => setPagination({ limit })}
            pageSizeOptions={[10, 20, 50, 100]}
            lastPage={data.last_page}
            currentPage={data.current_page}
          />
        </div>
      </div>
    </div>
  );
}