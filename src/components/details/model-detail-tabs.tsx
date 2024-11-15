import { SquareGanttChartIcon } from "lucide-react";
import Link from "next/link";
import TableIconSelector from "../table-icon-selector";
import { appString } from "@/lib/utils";

interface DataDetailTabsProps {
  tabs: {
    label: string;
    value: string;
    table: string;
  }[];
  tabValue: string;
  params: {
    baseId: string;
    tableName: string;
    recordId: string;
  };
}

export const DataDetailTabs: React.FC<DataDetailTabsProps> = ({
  tabs,
  tabValue,
  params,
}) => {
  const { baseId, tableName, recordId } = params;

  function getRelationUrl(relation: {
    value: string;
    label: string;
  }) {
    if (relation.value === appString('record_details')) {
      return `/bases/${baseId}/tables/${tableName}/${recordId}`;
    } else {
      return `/bases/${baseId}/tables/${tableName}/${recordId}/relations/${relation.value}`;
    }
  }

  return (
    <div className="inline-flex h-9 items-center justify-center rounded-lg text-muted-foreground bg-transparent gap-1">
      {tabs.map((item, index) => tabValue === item.value 
      ? <div key={item.value}>
          <div
            className="flex items-center justify-center select-none whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all  disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground border hover:border-border border-border px-2 h-8 gap-1 cursor-pointer"
          >
            {index === 0
            ? <SquareGanttChartIcon className="size-4" />
            // : <TableIcon className="size-4" />
            : <TableIconSelector size="sm" baseId={baseId} tableName={item.table} selector={false} />}
            {item.label}
          </div>
        </div> 
      : <Link key={item.value} href={getRelationUrl(item)}>
        <div
          className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-transparent hover:border-border px-2 h-8 gap-1"
        >
          {index === 0
          ? <SquareGanttChartIcon className="size-4" />
          // : <TableIcon className="size-4" />
          : <TableIconSelector size="sm" baseId={baseId} tableName={item.table} selector={false} />}
          {item.label}
        </div>
      </Link>)}
    </div>
  );
};
