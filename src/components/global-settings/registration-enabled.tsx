import { useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function RegistrationEnabled({
  settings,
  updateSettings
}: {
  settings: any;
  updateSettings: (settings: any) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="grid gap-1.5">
        <Label htmlFor="allow-registration">允许用户注册</Label>
        <div className="text-sm text-muted-foreground">
          开启后，新用户可以自行注册账号
        </div>
      </div>
      <Switch
        id="allow-registration"
        defaultChecked={settings?.allow_registration}
        onCheckedChange={(state) => updateSettings({
          allow_registration: state
        })}
      />
    </div>
  )
}