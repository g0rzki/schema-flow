import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import { TableNode } from './TableNode'

const nodeTypes = { tableNode: TableNode }

interface SchemaCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: import('@xyflow/react').NodeChange[]) => void
}

export function SchemaCanvas({ nodes, edges, onNodesChange }: SchemaCanvasProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm select-none">
        Paste SQL and click Visualize
      </div>
    )
  }

  return (
    <div className="flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!text-neutral-300 dark:!text-neutral-700" />
        <Controls className="!border-neutral-200 dark:!border-neutral-700 !bg-white dark:!bg-neutral-900 !shadow-none" />
        <MiniMap
          className="!border-neutral-200 dark:!border-neutral-700 !bg-white dark:!bg-neutral-900"
          nodeColor="#a3a3a3"
        />
      </ReactFlow>
    </div>
  )
}