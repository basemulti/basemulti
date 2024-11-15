"use client";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Edit, Eye, List, Trash } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import SchemaBuilder from "@/lib/schema-builder";
import ModelDetailItem from "./model-detail-item";
import { AlertModal } from "../modal/alert-modal";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { deleteRecord } from "@/actions/record";
import { toast } from "sonner";
export const IMG_MAX_LIMIT = 3;

interface ProductFormProps {
  initialData: any | null;
  tableSchema: any;
}

export const DataDetail: React.FC<ProductFormProps> = ({
  tableSchema,
  initialData,
}) => {
  const { baseId, tableName: paramTableName, recordId, relationName }: {
    baseId: string;
    tableName: string;
    recordId: string;
    relationName: string;
  } = useParams();
  const tableName = decodeURIComponent(paramTableName);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = `${tableSchema.label} Detail`;
  const description = `${tableSchema.label} Detail`;
  const pathname = usePathname();

  // const tableFormSchema = Object.keys(tableSchema.fields).map((key) => {
  //   return getColumnSchema(tableSchema, key);
  // });

  const tableFormSchema = SchemaBuilder.table(tableSchema).ui(true);
  const defaultValues = initialData
    ? initialData
    : {
        name: "",
        description: "",
        price: 0,
        imgUrl: [],
        category: "",
      };

  const form = useForm<any>({
    defaultValues,
  });

  const onDelete = () => {
    if (loading) return;
    setLoading(true);
    deleteRecord({
      baseId,
      tableName,
      id: recordId
    }, {
      originalPath: pathname,
    })
    .then(result => {
      if (result.error) {
        throw new Error(result.error);
      }
    })
    .catch (e => {
      toast.error(e.message);
    })
    .finally(() => {
      setLoading(false);
      setOpen(false);
    })
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <ScrollArea className="h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mx-5">
          <Heading title={'Record Details'} description={description} />
          <div className="flex flex-row items-center space-x-3">
            <Button
              variant="secondary"
              asChild
            >
              <Link href={`/bases/${baseId}/tables/${tableName}`}><List className="h-4 w-4 mr-2" /> List</Link>
            </Button>
            <Button
              variant="secondary"
              asChild
            >
              <Link href={`/bases/${baseId}/tables/${tableName}/${recordId}/edit`}><Edit className="h-4 w-4 mr-2" /> Edit</Link>
            </Button>
            <Button
              disabled={loading}
              variant="destructive"
              onClick={() => setOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
        <div className="space-y-8 w-full rounded-md border mx-5">
          <div className="divide-y gap-8">
            {Object.values(tableFormSchema).map((columnSchema: any) => {
              return <ModelDetailItem
                key={columnSchema.meta.name}
                column={columnSchema.meta.name}
                getValues={form.getValues}
                schema={columnSchema}
              />
            })}
          </div>
        </div>
        <ScrollBar />
      </ScrollArea>
    </>
  );
};
