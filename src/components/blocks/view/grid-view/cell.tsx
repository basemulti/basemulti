import { flexRender } from "@tanstack/react-table";
import type { Cell } from "@tanstack/react-table";
import { FieldValue } from "@/components/field-types";
import { selectId } from "@/lib/utils";

export default function Cell({
  ui,
  cell,
  baseId,
  tableName,
  provider,
  preview = false,
  isSharingPage = false,
}: {
  ui: any;
  cell: Cell<any, unknown>;
  baseId: string;
  tableName: string;
  provider: string;
  preview?: boolean;
  isSharingPage?: boolean;
}) {
  if (cell.column.id === selectId) {
    return <FieldValue
      type={'string'}
      value={flexRender(
        cell.column.columnDef.cell,
        cell.getContext(),
      )}
      schema={ui}
      row={cell.row.original}
      isSharingPage={isSharingPage}
    />;
  }

  // if (provider === 'default') {
  //   return <FieldValue
  //     type={ui?.type}
  //     value={cell.getValue()}
  //     schema={ui}
  //     row={cell.row.original}
  //     preview={preview}
  //     baseId={baseId}
  //     tableName={tableName}
  //     isSharingPage={isSharingPage}
  //   />;
  // }

  return <FieldValue
    type={ui?.type}
    value={cell.getValue()}
    schema={ui}
    row={cell.row.original}
    preview={preview}
    baseId={baseId}
    tableName={tableName}
    isSharingPage={isSharingPage}
  />;
}