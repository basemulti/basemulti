"use client";

import { useRouter } from "next-nprogress-bar";
import React, { Fragment } from "react";
import {
  Breadcrumb as BreadcrumbBase,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type BreadCrumbType = {
  title: string;
  link: string;
  list?: any[];
};

type BreadCrumbPropsType = {
  items: BreadCrumbType[];
  className?: string;
};

export default function Breadcrumb({ items }: BreadCrumbPropsType) {
  const router = useRouter();

  return (
    <BreadcrumbBase>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {items?.map((item: BreadCrumbType, index: number) => (
          <Fragment key={item.title}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index + 1 === items.length
                ? <BreadcrumbPage>{item.title}</BreadcrumbPage>
                : <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              }
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </BreadcrumbBase>
  )
}

// export default function BreadCrumb({ items, className }: BreadCrumbPropsType) {
//   const router = useRouter();

//   return (
//     <>
//       <div className="flex items-center space-x-1 text-sm text-muted-foreground">
//         {/* <Link
//           href={"/dashboard"}
//           className="overflow-hidden text-ellipsis whitespace-nowrap"
//         >
//           Dashboard
//         </Link> */}
//         {items?.map((item: BreadCrumbType, index: number) => (
//           <React.Fragment key={item.title}>
//             {index > 0 && <ChevronRightIcon className="h-4 w-4" />}
//             <Link
//               href={item.link}
//               className={cn(
//                 "font-medium",
//                 index === items.length - 1
//                   ? "text-foreground pointer-events-none"
//                   : "text-muted-foreground",
//               )}
//             >
//               {item.title}
//             </Link>
//           </React.Fragment>
//         ))}
//       </div>
//       <div className="rounded-md hover:bg-slate-100 p-1 cursor-pointer" onClick={() => {
//         startProgress();
//         router.refresh();
//         stopProgress();
//       }}>
//         <RotateCwIcon className="text-slate-500 w-3 h-3" />
//       </div>
//     </>
//   );
// }
