'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ModelForm } from "./model-form";
import { useEffect, useState } from "react";
import { useSchemaStore } from "@/store/base";
import { editRecord, getRecord } from "@/actions/record";
import ButtonLoading from "../button-loading";
import Bar from "../bar";
import { ChevronRightIcon, Maximize2Icon, SquareGanttChartIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import pick from "lodash/pick";
import { Form } from "../ui/form";
import { useGlobalStore } from "@/store/global";
import { useRouter } from "next-nprogress-bar";
import Loading from "../loading";
import RecordActions from "../blocks/record/record-actions";
import TableIconSelector from "../table-icon-selector";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

export default function ModalDetail({ disabled }: {
  // baseId: string;
  // tableName: string;
  // recordId: string;
  // data: any;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const { open, setOpen, detailInfo, allows } = useGlobalStore(store => ({
    open: store.detailModalOpen,
    setOpen: store.setDetailModalOpen,
    detailInfo: store.detailModalInfo,
    allows: store.allows,
  }));
  const t = useTranslations('Record');
  const pathname = usePathname();

  const [data, setData] = useState<any>(null);
  const { schema } = useSchemaStore(store => ({
    schema: store.schema,
  }));

  const router = useRouter();

  useEffect(() => {
    if (open && detailInfo) {
      getRecord(detailInfo).then(result => {
        if (result.error) {
          throw new Error(result.error);
        }

        setData(result.data);
        form.reset(pick(result.data, Object.keys(schema?.getFields(detailInfo.tableName) || { })))
      }).catch(e => {});
    }

    if (!open) {
      setData(null);
    }
  }, [open, detailInfo]);

  const form = useForm({
    // resolver: zodResolver(formSchema),
    defaultValues: data,
  });

  const { isDirty, dirtyFields } = form.formState;
  const { baseId, tableName, recordId } = detailInfo || {
    baseId: '',
    tableName: '',
    recordId: '',
  };

  const tableSchema = tableName ? schema?.getTableSchema(tableName) : undefined;

  const onSubmit = async (data?: any) => {
    setLoading(true);
    editRecord({
      baseId,
      tableName,
      id: recordId,
      data: pick(data, [...Object.keys(dirtyFields)])
    }, {
      originalPath: pathname,
    })
    .then(result => {
      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Update successful.");
    })
    .catch(e => {
      toast.error("Uh oh! Something went wrong.", {
        description: e.message,
      });
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        {children}
      </DialogTrigger> */}
      <DialogContent
        className="flex flex-col items-center p-0 h-[calc(100vh-100px)] max-w-[calc(100vw-100px)] md:w-[950px] gap-0 focus-visible:outline-none"
        visibleClose={false}
      >
        {data ? <div className="flex-1 size-full flex flex-col">
          <Bar>
            <div className="flex items-center gap-2 text-sm font-medium">
              <TableIconSelector baseId={baseId} tableName={tableName} selector={false} />
              {tableSchema?.label}
              <ChevronRightIcon className="text-muted-foreground size-4" />
              <SquareGanttChartIcon className="size-4" />
              {t('details')}
            </div>
            <div className="flex items-center gap-2">
              {allows(baseId, 'base', 'record:update') && <>
                <Form {...form}>
                  <Button className="px-3 h-7" disabled={data ? !isDirty || loading : loading} onClick={(e) => {
                    // form.handleSubmit(onSubmit)()
                    e.preventDefault();
                    onSubmit(form.getValues())
                  }}>
                    <ButtonLoading className="mr-2" loading={loading} />
                    {t('save')}
                  </Button>
                </Form>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer" onClick={() => {
                      router.push(`/bases/${detailInfo?.baseId}/tables/${detailInfo?.tableName}/${detailInfo?.recordId}`);
                      setOpen(false);
                    }}>
                      <Maximize2Icon className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('full_page')}</p>
                  </TooltipContent>
                </Tooltip>
                <RecordActions
                  baseId={detailInfo?.baseId ?? ''}
                  tableName={detailInfo?.tableName ?? ''}
                  recordId={detailInfo?.recordId ?? ''}
                  onDelete={() => setOpen(false)}
                />
              </>}
              <div className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer" onClick={() => {
                setOpen(false);
              }}>
                <XIcon className="w-4 h-4" />
              </div>
            </div>
          </Bar>
          <div className="pl-24 pr-6 py-4 h-[calc(100vh-150px)] overflow-y-scroll">
            <Form {...form}>
              {(schema && detailInfo) && <ModelForm
                schema={schema}
                baseId={detailInfo.baseId}
                tableName={detailInfo.tableName}
                disabled={disabled}
                data={data}
              />}
            </Form>
          </div>
        </div> : <Loading />}
      </DialogContent>
    </Dialog>
  );
}