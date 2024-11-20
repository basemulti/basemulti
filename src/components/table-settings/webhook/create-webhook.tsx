import createWebhook, { updateWebhook } from "@/actions/webhook";
import ButtonLoading from "@/components/button-loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const types = ['record.create', 'record.update', 'record.delete', 'action', 'bulk-action'];

type CreateWebhookProps = {
  children: React.ReactNode;
  baseId: string;
  tableName: string;
  initData?: any;
} & React.HTMLAttributes<HTMLDivElement>;

export default function CreateWebhook({
  children,
  baseId,
  tableName,
  initData,
}: CreateWebhookProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Table.Settings.Webhooks.Create');
  const title = t(initData ? 'edit' : 'create');

  const form = useForm({
    defaultValues: {
      label: initData?.label,
      type: initData?.type || 'record.create',
      method: initData?.method || 'POST',
      endpoint: initData?.endpoint,
    }
  })

  const handleSubmit = () => {
    if (loading) return;
    setLoading(true);

    const values = form.getValues();
    if (!initData) {
      createWebhook({
        baseId: baseId,
        tableName: tableName,
        label: values.label,
        type: values.type,
        method: values.method,
        endpoint: values.endpoint,
      }, {
        originalPath: pathname,
      }).then((result) => {
        if (result?.error) {
          throw new Error(result.error);
        }
  
        form.reset({
          label: '',
          type: 'record.create',
          method: 'POST',
          endpoint: '',
        });
        setOpen(false);
      }).catch(e => {
        toast.error('Webhook create failed', {
          description: e.message,
        });
      }).finally(() => setLoading(false));
    } else {
      updateWebhook({
        baseId: baseId,
        webhookId: initData?.id,
        label: values.label,
        type: values.type,
        method: values.method,
        endpoint: values.endpoint,
      }, {
        originalPath: pathname,
      }).then((result) => {
        if (result?.error) {
          throw new Error(result.error);
        }
  
        setOpen(false);
      }).catch(e => {
        toast.error('Webhook update failed', {
          description: e.message,
        });
      }).finally(() => setLoading(false));
    }
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>
    <DialogContent className="md:min-w-[640px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('label')}</FormLabel>
                <FormControl>
                  <Input
                    className="h-8"
                    placeholder={''}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Label>{t('endpoint')}</Label>
          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key={'POST'} value={'POST'}>
                        POST
                        </SelectItem>
                        <SelectItem key={'PATCH'} value={'PATCH'}>
                        PATCH
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      className="h-8"
                      placeholder={'https://'}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('type')}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map(type => <SelectItem key={type} value={type}>
                      {type}
                      </SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Form>
      <DialogFooter>
        <Button variant={'secondary'} className="h-8 px-3" onClick={() => setOpen(false)}>
          {t('cancel')}
        </Button>
        <Button className="h-8 px-3" disabled={loading} onClick={handleSubmit}>
          <ButtonLoading loading={loading} />
          {t('submit')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}