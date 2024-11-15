'use client';

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CircleAlertIcon, CircleCheck, Undo2Icon } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import ButtonLoading from "@/components/button-loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBase, testConnection, updateConnection } from "@/actions/base";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { DatabaseProviderType } from "@/lib/types";
import { baseProviders, connectionToFormValues, getBaseProviderLabel, getProviderDefaultValues, ProviderConnectionEditor, ProviderIcon } from "@/components/providers";
import { useTranslations } from "next-intl";

export default function Index({ workspaceId, baseId, label, connection, provider, isEdit = true, onBack, onSubmit }: {
  workspaceId: string;
  baseId?: string;
  label: string;
  provider: DatabaseProviderType;
  connection: any;
  isEdit?: boolean;
  onBack?: Function;
  onSubmit?: Function;
}) {
  const t = useTranslations('Base.Settings.Connection');
  const submitTitle = t(isEdit ? 'update_connection' : 'create_connection');
  
  const [baseLabel, setBaseLabel] = useState(label);
  const [baseProvider, setBaseProvider] = useState(provider);
  const [loading, setLoading] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState({
    status: 'not_started',
    message: ''
  });

  useEffect(() => {
    form.reset({ ...connectionToFormValues({ name: provider, connection }) });
  }, [connection]);

  const form = useForm<any>({
    defaultValues: connectionToFormValues({ name: provider, connection })
  });

  console.log('connection', connection, connectionToFormValues({ name: provider, connection }), form.watch())

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change') {
        setTestStatus({ status: 'not_started', message: ''})
      }
    });
    return () => subscription.unsubscribe()
  }, [form.watch])

  const handleTestConnection = async () => {
    if (testing || testStatus.status === 'success') return;
    setTesting(true);
    const result = await testConnection({
      provider: baseProvider,
      connection: form.getValues(),
    });
    setTesting(false);
    setTestStatus(result);
  }

  const handleUpdateConnection = () => {
    if (loading || !baseId) return;
    setLoading(true);
    updateConnection({
      id: baseId,
      connection: {
        provider: baseProvider,
        connection: form.getValues()
      },
    }).then((result) => {
      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Connection updated', {
        description: 'Connection updated successfully',
      });
    }).catch(e => {
      toast.error('Connection update failed', {
        description: e.message,
      });
    }).finally(() => setLoading(false));
  }

  const handleChangeProvider = (name: DatabaseProviderType) => {
    setBaseProvider(name);
    form.reset(getProviderDefaultValues(name));
  }

  const handleCreateConnection = () => {
    if (loading) return;
    setLoading(true);
    createBase({
      workspace_id: workspaceId,
      label: baseLabel,
      provider: baseProvider,
      connection: form.getValues()
    }).then((result) => {
      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Connection created', {
        description: 'Connection created successfully',
      });
      onSubmit && onSubmit();
    }).catch(e => {
      toast.error('Connection create failed', {
        description: e.message,
      });
    }).finally(() => setLoading(false));
  }

  const handleSubmit = async () => {
    // console.log(form.getValues());
    if (isEdit && baseId) {
      await handleUpdateConnection();
    } else {
      await handleCreateConnection();
    }
  }
  
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => {})}
        // className="space-y-8 w-full"
      >
        <div className="max-w-screen-lg mx-auto mt-8 w-full flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <div className="relative">
              {!isEdit && <Button variant={'outline'} className="h-8 px-2 gap-2" onClick={() => {
                onBack && onBack();
              }}>
                <Undo2Icon className="size-4" />
                {t('go_back')}
              </Button>}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant={'outline'} className={'h-8 px-2'} disabled={testing} onClick={handleTestConnection}>
                <ButtonLoading loading={testing} />
                {testStatus.status === 'success' && !testing && <CircleCheck className="size-4 text-green-500 mr-1" />}
                {testStatus.status === 'error' && !testing && <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleAlertIcon className="size-4 text-red-500 mr-1" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{testStatus.message}</p>
                  </TooltipContent>
                </Tooltip>}
                {t('test_connection')}
              </Button>
              <Button type="button" className={'h-8 px-2'} disabled={testStatus.status !== 'success' || loading} onClick={handleSubmit}>
                <ButtonLoading loading={loading} />
                {submitTitle}
              </Button>
            </div>
          </div>
          <div className="rounded-md border border-border">
            <div className="size-full flex flex-row">
              <ScrollArea className="h-[calc(100vh-200px)] flex-1">
                <div className="flex-1 flex flex-col gap-2 p-4">
                  <div className="font-medium mb-2">{t('general')}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="label">{t('label')}</Label>
                      <Input className="h-8" type="text" id="label" placeholder="Base Label" value={baseLabel} onChange={(e) => {
                        setBaseLabel(e.target.value);
                      }} />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="provider">{t('provider')}</Label>
                      <Select disabled={isEdit} value={baseProvider} onValueChange={handleChangeProvider}>
                        <SelectTrigger className="h-8 disabled:opacity-100">
                          <SelectValue placeholder="Select a verified email to display" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(baseProviders).map((providerName) => <SelectItem key={providerName} className="" value={providerName}>
                            <div className="flex items-center gap-2">
                              <ProviderIcon name={providerName} />
                              <span>{getBaseProviderLabel(providerName)}</span>
                            </div>
                          </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <ProviderConnectionEditor
                    name={baseProvider}
                    title={t('connection_details')}
                  />
                </div>
              </ScrollArea>
              <div className="w-80 h-auto border-l border-border p-8 bg-muted/50 text-sm flex flex-col gap-2">
                <p>{t('prompt')}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}