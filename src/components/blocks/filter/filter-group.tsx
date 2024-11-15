import { PlusIcon, TrashIcon } from "lucide-react";
import FilterMethod from "./filter-method";
import FilterColumn from "./filter-column";
import FilterOperator from "./filter-operator";
import { Button } from "@/components/ui/button";

export default function FilterGroup({ index, method, params, filters, setFilters, tableName }: {
  index: number;
  method: string;
  params: string[];
  filters: any[];
  setFilters: Function;
  tableName: string;
}) {
  const handleRemoveFilterGroup = () => {
    const newFilters = filters.filter((filter: any, i: number) => {
      return i !== index;
    });
    setFilters(newFilters);
  };

  const handleRemoveFilter = (childIndex: number) => {
    const newFilters = filters.map((filter: any, i: number) => {
      if (i === index) {
        return [
          filter[0],
          filter[1].filter((child: any, j: number) => {
            return j !== childIndex;
          })
        ];
      }
      return filter;
    });
    setFilters(newFilters);
  }

  const handleAddFilter = () => {
    const newFilters = filters.map((filter: any, i: number) => {
      if (i === index) {
        return [
          filter[0],
          [...filter[1], ['where', ['id', '=', '']]]
        ];
      }
      return filter;
    });
    setFilters(newFilters);
  }

  return <div className="border border-border rounded-md bg-slate-100 p-2 my-1">
    <div className="flex flex-row items-center justify-between">
      <FilterMethod
        filters={filters}
        setFilters={setFilters}
        method={method}
        params={params}
        index={index}
        className="border-r rounded-r-md"
      />
      <div className="flex flex-row items-center gap-2">
        <PlusIcon className="size-4 cursor-pointer" onClick={handleAddFilter} />
        <TrashIcon className="size-4 cursor-pointer" onClick={handleRemoveFilterGroup} />
      </div>
    </div>
    {params.map(([method, params]: any, i: number) => {
      return <div key={i} className="my-1 flex items-center">
        <FilterMethod
          filters={filters}
          setFilters={setFilters}
          method={method}
          params={params}
          index={`${index}.1.${i}`}
        />
        <FilterColumn
          params={params}
          index={`${index}.1.${i}`}
          tableName={tableName}
          filters={filters}
          setFilters={setFilters}
        />
        <FilterOperator
          filters={filters}
          setFilters={setFilters}
          params={params}
          index={`${index}.1.${i}`}
          tableName={tableName}
        />
        <Button variant={'outline'} className="h-8 px-2 rounded-l-none border-l-0 text-xs bg-white" onClick={() => handleRemoveFilter(index)}>
          <TrashIcon className="size-4" />
        </Button>
      </div>;
    })}
  </div>;
}