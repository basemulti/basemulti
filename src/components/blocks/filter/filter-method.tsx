import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import get from "lodash/get";
import set from "lodash/set";
import { useTranslations } from "next-intl";

export default function FilterMethod({ method, params, filters, setFilters, index, className }: {
  method: string,
  params: any,
  filters: any,
  setFilters: Function,
  index: number | string;
  className?: string;
}) {
  const path = index.toString().split('.');
  const key = Number(path.pop());
  const t = useTranslations('ViewBar.Filter');


  const handleChangeValue = (value: string) => {
    let newFilters = structuredClone(filters);

    const callback = (item: any, i: number) => {
      if (i > 0) {
        return [
          value,
          item[1]
        ]
      }

      return item;
    }

    if (path.length > 0) {
      set(
        newFilters, 
        path.join('.'), 
        get(newFilters, path).map(callback)
      );
    } else {
      newFilters = newFilters.map(callback);
    }

    setFilters(newFilters);
  }

  if (key === 0) {
    return <Button variant={'outline'} className={cn("w-[66px] h-8 text-sm rounded-r-none border-r-0 bg-white", className)} disabled>
      {t('where')}
    </Button>
  }

  return (
    <Select onValueChange={handleChangeValue} value={method} disabled={key != 1}>
      <SelectTrigger className={cn("w-[66px] h-8 text-sm rounded-r-none border-r-0 focus-visible:outline-none focus:outline-none focus:ring-0 bg-white", className)}>
        <SelectValue placeholder="Select an option..." />
      </SelectTrigger>
      {/* <SelectTrigger asChild>
        <Button variant={'outline'} className="w-[66px] h-8 text-sm rounded-r-none border-r-0">
          {getMethodText(method, index)}
        </Button>
      </SelectTrigger> */}
      <SelectContent>
        <SelectItem value={'where'}>{t('and')}</SelectItem>
        <SelectItem value={'orWhere'}>{t('or')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
