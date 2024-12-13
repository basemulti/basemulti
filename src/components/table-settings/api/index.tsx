'use client';

import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { getData } from "./code";
import APISidebar from "./api-sidebar";

export default function Api() {
  const [language, setLanguage] = useState("Shell");
  const [codeKey, setCodeKey] = useState(0);
  const { baseId, tableName }: { baseId: string, tableName: string} = useParams();
  const data = useMemo(() => getData({ baseId, tableName }), [baseId, tableName]);

  return (
    <div className="max-w-screen-lg mx-auto mt-8 w-full flex gap-2">
      <APISidebar data={data} language={language} setLanguage={setLanguage} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 text-sm">
          {data.map((item) => <div key={item.name} className={cn(
            "px-4 py-3 border border-border rounded-lg shadow-sm bg-muted/30",
            item.name === language ? 'block' : 'hidden'
          )}>
            <Tabs defaultValue={item?.codes?.[0]?.name}>
              <div className="flex items-center justify-between">
                <TabsList>
                  {item?.codes?.map((code, index) => <TabsTrigger key={code.name} value={code.name} onSelect={() => setCodeKey(index)}>
                    {code.name}
                  </TabsTrigger>)}
                </TabsList>
                <Button
                  variant={'outline'}
                  className="w-7 h-7 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(item?.codes?.[codeKey]?.code as string);
                    toast.success('Copied to clipboard');
                  }}
                  title={'Copy'}
                >
                  <CopyIcon className="size-4" />
                </Button>
              </div>
              {item?.codes?.map((code) => <TabsContent key={code.name} value={code.name}>
                <pre className="text-sm text-gray-800 font-mono overflow-x-auto break-words whitespace-pre-wrap">
                  <code>{code.code}</code>
                </pre>
              </TabsContent>)}
            </Tabs>
          </div>)}
        </div>
      </main>
    </div>
  );
}