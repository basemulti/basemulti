'use client';

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Settings2Icon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loading from "@/components/loading";
import SwitchSettings from "@/components/global-settings/switch-settings";
import { toast } from "sonner";
import ButtonLoading from "@/components/button-loading";

type S3Config = {
  endpoint: string;
  region: string;
  bucket: string;
  access_key: string;
  secret_key: string;
  storage_prefix: string;
};

type WebhookConfig = {
  url: string;
  method: string;
  headers: { key: string; value: string }[];
  timeout: number;
  retries: number;
};

export default function Settings() {
  const [configOpen, setConfigOpen] = useState(false);
  const [configType, setConfigType] = useState<'s3' | 'webhook'>('s3');
  const [s3Config, setS3Config] = useState<S3Config>({
    endpoint: '',
    region: '',
    bucket: '',
    access_key: '',
    secret_key: '',
    storage_prefix: '',
  });
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    url: '',
    method: 'POST',
    headers: [],
    timeout: 30,
    retries: 3,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await axios.get(`/api/settings`);
      return response.data;
    },
  });

  const updateSetting = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(`/api/settings`, data);
      return response.data;
    },
  });

  const storageOptions = [
    {
      id: 'local',
      title: '本地存储',
      description: '将文件存储在 /public/storage 文件夹中',
    },
    {
      id: 's3',
      title: 'AWS S3',
      description: '使用 Amazon S3 或其他兼容的对象存储服务',
      setting: true,
      onClick: () => {
        setConfigType('s3');
        setS3Config(data?.storage_s3_config);
        setConfigOpen(true);
      },
    },
    {
      id: 'webhook',
      title: 'Webhook',
      description: '文件会传递给 Webhook',
      setting: true,
      onClick: () => {
        setConfigType('webhook');
        setWebhookConfig(data?.storage_webhook_config);
        setConfigOpen(true);
      },
    }
  ];

  const handleSetS3Config = async () => {
    updateSetting.mutate({
      storage_s3_config: s3Config,
    }, {
      onSuccess: () => {
        toast.success('S3 config updated');
      }
    });
  }

  const handleSetWebhookConfig = async () => {
    if (webhookConfig.url === '') {
      toast.error('Webhook URL cannot be empty');
      return;
    }

    updateSetting.mutate({
      storage_webhook_config: webhookConfig,
    }, {
      onSuccess: () => {
        toast.success('Webhook config updated');
      }
    });
  }

  const renderConfigDialog = () => {
    if (configType === 's3') {
      return (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>S3 存储配置</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="endpoint">服务端点</Label>
              <Input
                id="endpoint"
                className="h-8"
                placeholder="https://s3.amazonaws.com"
                value={s3Config.endpoint}
                onChange={(e) => setS3Config({ ...s3Config, endpoint: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">区域</Label>
              <Input
                id="region"
                className="h-8"
                placeholder="us-east-1"
                value={s3Config.region}
                onChange={(e) => setS3Config({ ...s3Config, region: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bucket">存储桶</Label>
              <Input
                id="bucket"
                className="h-8"
                placeholder="my-bucket"
                value={s3Config.bucket}
                onChange={(e) => setS3Config({ ...s3Config, bucket: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="access_key">访问密钥 ID</Label>
              <Input
                id="access_key"
                type="password"
                className="h-8"
                placeholder="access-key-id"
                value={s3Config.access_key}
                onChange={(e) => setS3Config({ ...s3Config, access_key: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secret_key">访问密钥密码</Label>
              <Input
                id="secret_key"
                type="password"
                className="h-8"
                placeholder="secret-access-key"
                value={s3Config.secret_key}
                onChange={(e) => setS3Config({ ...s3Config, secret_key: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storage_prefix">存储访问前缀</Label>
              <Input
                id="storage_prefix"
                className="h-8"
                placeholder="e.g. https://my-bucket.s3.us-east-1.amazonaws.com"
                value={s3Config.storage_prefix}
                onChange={(e) => setS3Config({ ...s3Config, storage_prefix: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-8 px-4 py-2" onClick={() => setConfigOpen(false)}>取消</Button>
            <Button className="h-8 px-4 py-2" onClick={handleSetS3Config} disabled={updateSetting.isPending}>
              <ButtonLoading loading={updateSetting.isPending} />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      );
    }

    if (configType === 'webhook') {
      return (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Webhook 配置</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">目标 URL</Label>
              <Input
                id="url"
                className="h-8"
                placeholder="https://api.example.com/files"
                value={webhookConfig.url}
                onChange={(e) => setWebhookConfig({ ...webhookConfig, url: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>请求头</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWebhookConfig({
                    ...webhookConfig,
                    headers: [...(webhookConfig.headers || []), { key: '', value: '' }]
                  })}
                >
                  添加请求头
                </Button>
              </div>
              <div className="space-y-2">
                {(webhookConfig?.headers || []).map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Header Name"
                      value={header.key}
                      className="h-8 flex-1"
                      onChange={(e) => {
                        const newHeaders = [...webhookConfig.headers];
                        newHeaders[index].key = e.target.value;
                        setWebhookConfig({ ...webhookConfig, headers: newHeaders });
                      }}
                    />
                    <Input
                      placeholder="Value"
                      value={header.value}
                      className="h-8 flex-1"
                      onChange={(e) => {
                        const newHeaders = [...webhookConfig.headers];
                        newHeaders[index].value = e.target.value;
                        setWebhookConfig({ ...webhookConfig, headers: newHeaders });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const newHeaders = webhookConfig.headers.filter((_, i) => i !== index);
                        setWebhookConfig({ ...webhookConfig, headers: newHeaders });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeout">超时时间（秒）</Label>
              <Input
                id="timeout"
                type="number"
                min="1"
                className="h-8"
                placeholder="10"
                value={webhookConfig.timeout}
                onChange={(e) => setWebhookConfig({ ...webhookConfig, timeout: parseInt(e.target.value) || 30 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="retries">重试次数</Label>
              <Input
                id="retries"
                type="number"
                min="0"
                className="h-8"
                placeholder="1"
                value={webhookConfig.retries}
                onChange={(e) => setWebhookConfig({ ...webhookConfig, retries: parseInt(e.target.value) || 3 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-8 px-4 py-2" onClick={() => setConfigOpen(false)}>取消</Button>
            <Button className="h-8 px-4 py-2" disabled={updateSetting.isPending} onClick={handleSetWebhookConfig}>
              <ButtonLoading loading={updateSetting.isPending} />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 size-full flex flex-col">
      <div>
        <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <div className="text-base font-bold">系统设置</div>
          </div>
        </div>
      </div>
      {isLoading 
      ? <Loading />
      : <div className="flex justify-center p-6">
        <div className="w-full max-w-screen-lg space-y-12">
          {/* 通用设置 */}
          <div className="space-y-4">
            <div>
              <h2 className="font-medium">通用设置</h2>
            </div>
            <Separator />
            <SwitchSettings
              title="允许用户注册"
              description="开启后，新用户可以自行注册账号"
              checked={data?.allow_registration}
              onCheckedChange={(state) => updateSetting.mutate({ allow_registration: state })}
            />
            <SwitchSettings
              title="允许用户创建工作区"
              description="开启后，新用户可以自行创建工作区"
              checked={data?.allow_create_workspace}
              onCheckedChange={(state) => updateSetting.mutate({ allow_create_workspace: state })}
            />
          </div>

          {/* 功能设置 */}
          <div className="space-y-4">
            <div>
              <h2 className="font-medium">功能设置</h2>
            </div>
            <Separator />
            <div className="grid gap-1.5">
              <Label>存储位置</Label>
              <div className="text-sm text-muted-foreground mb-4">
                选择文件的存储位置
              </div>
              <RadioGroup
                className="grid grid-cols-3 gap-4"
                defaultValue={data.storage_driver}
                onValueChange={(value) => {
                  updateSetting.mutate({ storage_driver: value });
                }}
              >
                {storageOptions.map((option) => (
                  <div key={option.id} className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
                    <div className="order-1 flex items-center gap-2">
                      {option.setting && <div
                        className="z-10 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          option.onClick?.();
                        }}
                      >
                        <Settings2Icon className="h-4 w-4 hover:text-muted-foreground" />
                      </div>}
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        aria-describedby={`${option.id}-description`}
                        className="order-1 after:absolute after:inset-0"
                      />
                    </div>
                    <div className="grid grow gap-2">
                      <Label htmlFor={`${option.id}`}>
                        {option.title}
                      </Label>
                      <p id={`${option.id}-description`} className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>}

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        {renderConfigDialog()}
      </Dialog>
    </div>
  );
}