import ModalDetailButton from "@/components/details/modal-detail-button";
import { ReactNode } from "react";

export default function CreateRecordButton({
  baseId,
  tableName,
  children,
}: {
  baseId: string;
  tableName: string;
  children: ReactNode
}) {
  return <ModalDetailButton
    baseId={baseId}
    tableName={tableName}
  >
    {children}
  </ModalDetailButton>
}