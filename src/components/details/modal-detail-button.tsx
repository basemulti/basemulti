'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ModelForm } from "./model-form";
import { useEffect, useState } from "react";
import { useSchemaStore } from "@/store/base";
import { createRecord, editRecord, getRecord } from "@/actions/record";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

export default function ModalDetailButton({ baseId, tableName, recordId, children }: {
  baseId: string;
  tableName: string;
  recordId?: string;
  // data: any;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { allows } = useGlobalStore(store => ({
    allows: store.allows,
  }));
  const t = useTranslations('Record');

  const [data, setData] = useState<any>(null);
  const { schema } = useSchemaStore(store => ({
    schema: store.schema,
  }));

  const router = useRouter();

  useEffect(() => {
    if (open && recordId) {
      getRecord({
        baseId: baseId,
        tableName: tableName,
        recordId: recordId,
      }).then(result => {
        if (result.error) {
          throw new Error(result.error);
        }

        setData(result.data);
        form.reset(pick(result.data, Object.keys(schema?.getFields(tableName) || { })))
      }).catch(e => {});
    } else if (open) {
      const defaultData = schema?.getDefaultRecord(tableName);
      console.log('defaultData', defaultData);
      setData(defaultData);
      form.reset(defaultData);
    }

    if (!open) {
      setData(null);
    }
  }, [open, recordId]);

  const form = useForm({
    // resolver: zodResolver(formSchema),
    defaultValues: data,
  });

  const { isDirty, dirtyFields } = form.formState;

  const tableSchema = tableName ? schema?.getTableSchema(tableName) : undefined;

  const onSubmit = async (data?: any) => {
    setLoading(true);
    if (recordId) {
      editRecord({
        baseId,
        tableName,
        id: recordId,
        data: pick(data, [...Object.keys(dirtyFields)])
      })
      .then(result => {
        if (result.error) {
          throw new Error(result.error);
        }
  
        toast.success("Update successful.");
        router.refresh();
      })
      .catch(e => {
        toast.error("Uh oh! Something went wrong.", {
          description: e.message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      createRecord({
        baseId: baseId,
        tableName: tableName,
        data: form.getValues()
      }, {
        originalPath: `/bases/${baseId}/tables/${tableName}`,
      })
      .then(result => {
        if (result.error) {
          throw new Error(result.error);
        }
  
        toast.success("Create successful.");
        setOpen(false);
      })
      .catch(e => {
        toast.error("Uh oh! Something went wrong.", {
          description: e.message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
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
                {recordId ? <Button className="px-3 h-7" disabled={data ? !isDirty || loading : loading} onClick={(e) => {
                  onSubmit(form.getValues())
                }}>
                  <ButtonLoading className="mr-2" loading={loading} />
                  {t('save')}
                </Button> : <Button className="px-3 h-7" disabled={loading} onClick={(e) => {
                  onSubmit(form.getValues())
                }}>
                  <ButtonLoading className="mr-2" loading={loading} />
                  {t('create')}
                </Button>}
                </Form>
                {recordId && <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer" onClick={() => {
                      router.push(`/bases/${baseId}/tables/${tableName}/${recordId}`);
                      setOpen(false);
                    }}>
                      <Maximize2Icon className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('full_page')}</p>
                  </TooltipContent>
                </Tooltip>}
                {recordId && <RecordActions
                  baseId={baseId ?? ''}
                  tableName={tableName ?? ''}
                  recordId={recordId ?? ''}
                  onDelete={() => setOpen(false)}
                />}
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
              {(schema) && <ModelForm
                schema={schema}
                baseId={baseId}
                tableName={tableName}
                data={data}
              />}
            </Form>
          </div>
        </div> : <Loading />}
      </DialogContent>
    </Dialog>
  );
}