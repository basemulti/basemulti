import 'react-markdown-editor-lite/lib/index.css';
import { Label } from "../ui/label";
import ModelDetailGrid from "./model-detail-grid";

export default function ModelDetailItem({ column, schema, getValues }: any) {
  if (!schema?.meta?.name) {
    return null;
  }

  return <div className="space-y-0 py-4 flex flex-row px-8 items-center">
    <Label className="w-1/5">{schema?.meta?.label}</Label>
    <div className="w-3/5 text-sm">
      <div>
        <ModelDetailGrid ui={schema} value={getValues(column)} row={getValues()} />
      </div>
    </div>
  </div>;
}