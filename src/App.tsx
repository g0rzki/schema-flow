import { ReactFlowProvider } from '@xyflow/react'
import { useSchema } from './hooks/useSchema'
import { Sidebar } from './components/Sidebar'
import { SchemaCanvas } from './components/SchemaCanvas'

export default function App() {
  const { sql, setSql, schema, nodes, edges, error, visualize, reset, onNodesChange, autoLayout } = useSchema()

  return (
    <ReactFlowProvider>
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
        <Sidebar
          sql={sql}
          setSql={setSql}
          onVisualize={visualize}
          onReset={reset}
          onAutoLayout={autoLayout}
          error={error}
          schema={schema}
        />
        <SchemaCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} />
      </div>
    </ReactFlowProvider>
  )
}