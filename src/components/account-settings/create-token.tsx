import { createToken } from "@/actions/token";
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
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type CreateTokenProps = {
  children: React.ReactNode;
  onCreate?: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

export default function CreateToken({
  children,
  onCreate,
}: CreateTokenProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('ModalAccount.Tokens.ModalCreateToken');
  const title = t('title');

  const form = useForm({
    defaultValues: {
      name: '',
    }
  })

  const handleSubmit = () => {
    if (loading) return;
    setLoading(true);

    const values = form.getValues();
    createToken({
      name: values.name,
    }).then(() => {
      form.reset({
        name: '',
      });
      onCreate && onCreate();
      setOpen(false);
    }).catch(e => {
      toast.error('Token create failed', {
        description: e.message,
      });
    }).finally(() => setLoading(false));
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
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