import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function SwitchSettings({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (state: boolean) => void;
}) {
  return (
    <div className="flex justify-between rounded-md border border-border p-4">
      <div className="grid gap-1.5">
        <Label htmlFor="allow-registration">{title}</Label>
        <div className="text-sm text-muted-foreground">
          {description}
        </div>
      </div>
      <Switch
        id="allow-registration"
        defaultChecked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}