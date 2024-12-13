import { CopyIcon, EyeIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { AlertModal } from "@/components/modal/alert-modal";
import { deleteToken } from "@/actions/token";
import { TableCell, TableRow } from "../ui/table";

type TokenItemProps = {
  token: any;
  onDelete?: () => void;
}

export default function TokenItem({
  token,
  onDelete,
}: TokenItemProps) {
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [tokenDeleting, setTokenDeleting] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);

  const handleDeleteToken = () => {
    setTokenDeleting(true);
    deleteToken({ id: token.id }).then(() => onDelete && onDelete()).catch(e => {
      toast.error(e.message);
      setTokenDeleting(false);
    }).finally(() => {
      setDeleteOpen(false);
      setTokenDeleting(false);
    });
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(token.token);
    toast.success('Copied to clipboard');
  }
  
  return <>
    <TableRow className="hover:bg-background">
      <TableCell className="font-medium w-1/5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px] truncate">
        <span className="">{token.name}</span>
      </TableCell>
      <TableCell className="w-3/5 cursor-pointer" onClick={handleCopy}>
        {show ? token.token : '****************************************'}
      </TableCell>
      <TableCell className="text-right w-1/5">
        <div className="flex items-center gap-1 justify-end">
          <Button variant={'ghost'} className="w-6 h-6 p-0" onClick={() => setShow(!show)}>
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button variant={'ghost'} className="w-6 h-6 p-0" onClick={handleCopy}>
            <CopyIcon className="w-4 h-4" />
          </Button>
          <Button variant={'ghost'} className="w-6 h-6 p-0" onClick={() => setDeleteOpen(true)}>
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
    <AlertModal
      isOpen={deleteOpen}
      onClose={() => setDeleteOpen(false)}
      onConfirm={handleDeleteToken}
      loading={tokenDeleting}
    />
  </>;
}