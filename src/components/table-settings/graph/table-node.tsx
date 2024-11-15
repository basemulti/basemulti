import { useState, FC, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { DatabaseIcon, TableIcon } from "lucide-react";

// import "@xyflow/react/node-resizer/dist/style.css";

export const TableNode: FC<NodeProps> = ({ data }: any) => {
  const [selectedColumn, setSelectedColumn] = useState("");
  const [showDescription, setshowDescription] = useState(false);
  const [descriptionOnHoverActive, setDescriptionOnHoverActive] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if(e.code === "MetaLeft") {
        setDescriptionOnHoverActive(true)
      }
    }, false);

    document.addEventListener("keyup", (e: KeyboardEvent) => {
      if(e.code === "MetaLeft") {
        setDescriptionOnHoverActive(false)
      }
    }, false);
  }, []);

  return (
    <div className="table rounded-md bg-background border border-border overflow-hidden text-sm">
      <div
        // className="table__name bg-indigo-500 text-white px-3 py-2 flex items-center gap-2"
        className="table__name px-3 py-2 flex items-center gap-2"
        onMouseEnter={() => {
          if(descriptionOnHoverActive) {
            setshowDescription(true)
          }
        }}
        onMouseLeave={() => setshowDescription(false)}>
        <TableIcon className="size-4 " />
        {data.schema ? `${data.schema}.${data.name}` : data.name}
      </div>

      <div className="table__columns">
        {data.columns.map((column: any, index: any) => (
          <div
            key={index}
            className={cn(
              "px-3 py-2 bg-accent",
              selectedColumn === column.name ? "column-name column-name--selected" : "column-name"
            )}
            onMouseEnter={() => {
              if(descriptionOnHoverActive) {
                setSelectedColumn(column.name)
              }
            }}
            onMouseLeave={() => setSelectedColumn("")}>
            {column.handleType && <Handle
              type={column.handleType}
              position={Position.Right}
              id={`${column.name}-right`}
              className={column.handleType === "source" ? "right-handle source-handle" : "right-handle target-handle"}
            />}
            {column.handleType && <Handle
              type={column.handleType}
              position={Position.Left}
              id={`${column.name}-left`}
              className={column.handleType === "source" ? "left-handle source-handle" : "left-handle target-handle"}
            />}

            <div className="column-name__inner flex items-center justify-between gap-4">
              <div className="column-name__name flex items-center gap-2">
                {/* {column.key && <KeyIcon />} */}
                {column.label}
              </div>
              <div className="column-name__type text-muted-foreground">
                {column.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};