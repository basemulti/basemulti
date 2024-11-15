import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

export default function SimplePagination({ page, onPageChange, total, lastPage, currentPage }: {
  page: number;
  onPageChange: (page: number) => void;
  total: number;
  lastPage: number;
  currentPage: number;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        aria-label="Go to previous page"
        variant="outline"
        className="h-6 w-6 p-0 bg-background"
        onClick={() => onPageChange(page - 1)}
        disabled={currentPage === 1 || total === 0}
      >
        <ChevronLeftIcon className="h-3 w-3" aria-hidden="true" />
      </Button>
      <Button
        aria-label="Go to next page"
        variant="outline"
        className="h-6 w-6 p-0 bg-background"
        onClick={() => onPageChange(page + 1)}
        disabled={currentPage === lastPage || total === 0}
      >
        <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
      </Button>
    </div>
  );
}