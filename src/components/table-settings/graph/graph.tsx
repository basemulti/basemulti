'use client';

import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
import TextUpdaterNode from '../text-updater-node';

import '../text-updater-node.css';
import { TableNode } from './table-node';
import { useSchemaStore } from '@/store/base';
import { FieldIcon } from '@/components/field-types';
 
const initialNodes = [
  { id: '1', position: { x: 50, y: 50 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  {
    id: 'node-1',
    type: 'textUpdater',
    position: { x: 0, y: 0 },
    data: { value: 123 },
  },
  {
    id: 'users-table',
    type: 'table',
    position: { x: 0, y: 0 },
    data: {
      schemaColor: '#0ea5e9',
      name: 'users',
      columns: [
        {
          name: 'id',
          type: 'number',
          label: 'ID',
          width: 100,
          align: 'left',
          handleType: 'source',
        }
      ]
    },
  }
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-1', source: '1', target: '2' }];

const nodeTypes = {
  textUpdater: TextUpdaterNode,
  table: TableNode,
};
const rfStyle = {
  backgroundColor: '#B8CEFF',
};

export default function Graph({ schema }: {
  schema: any;
}) {
  const { schema: schemaBuilder } = useSchemaStore(store => ({
    schema: store.schema,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    if (schemaBuilder) {
      setNodes(Object.entries(schemaBuilder?.getTables() ?? []).map(([tableName, table]) => {
        return {
          id: `${tableName}-table`,
          type: 'table',
          position: { x: 0, y: 0 },
          data: {
            name: tableName,
            columns: [
              ...Object.entries(table.fields).map(([fieldName, field]: [string, any]) => {
                return {
                  name: fieldName,
                  type: field.type,
                  label: <>
                    <FieldIcon type={field?.type ?? 'string'} />
                    {fieldName}
                  </>,
                  handleType: 'source',
                }
              }),
            ]
          },
        }
      }));
    }
  }, [schemaBuilder]);
 
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
 
  return (
    <div className='size-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        // style={rfStyle}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}