import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatWithCommas } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function Pagination({ page, onPageChange, total, limit, onLimitChange, pageSizeOptions, lastPage, currentPage }: {
  page: number;
  onPageChange: (page: number) => void;
  total: number;
  limit: number;
  onLimitChange: (limit: number) => void;
  pageSizeOptions: string[] | number[];
  lastPage: number;
  currentPage: number;
}) {
  const [pageInput, setPageInput] = useState(page);
  const t = useTranslations('Pagination');
  
  useEffect(() => {
    setPageInput(page);
  }, [page]);

  return <div>
    <div className="bg-background border-t border-border flex flex-col gap-2 sm:flex-row items-center justify-end space-x-2 h-[50px] px-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex-1 text-sm text-muted-foreground">
          {t('total', {
            total: total
          })} 
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
          <div className="flex items-center space-x-2">
            <p className="whitespace-nowrap text-sm font-medium">
              {t('per_page')}
            </p>
            <Select
              value={`${limit}`}
              onValueChange={(value) => onLimitChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={limit}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-2 lg:gap-2">
          <div className="flex items-center justify-center text-sm font-medium">
            {t.rich('current_page', {
              input: () => <Input className="w-10 h-8 mx-1 px-1 text-center" value={pageInput} onChange={(e) => {
                if (isNaN(Number(e.target.value))) {
                  return;
                }
                setPageInput(Number(e.target.value));
  
                if (Number(e.target.value) > lastPage) {
                  setPageInput(lastPage);
                }
                
                setTimeout(() => onPageChange(Number(e.target.value)), 100);
              }} />,
              lastPage: lastPage,
            })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              aria-label="Go to first page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to previous page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to next page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page + 1)}
              disabled={currentPage === lastPage}
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to last page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(lastPage)}
              disabled={currentPage === lastPage}
            >
              <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
}