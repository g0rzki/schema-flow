import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { Table } from '../types/schema'

interface TableNodeData {
  table: Table
  [key: string]: unknown
}

const COLORS = [
  { bg: 'bg-teal-50 dark:bg-teal-950', text: 'text-teal-800 dark:text-teal-200', dot: 'bg-teal-500' },
  { bg: 'bg-violet-50 dark:bg-violet-950', text: 'text-violet-800 dark:text-violet-200', dot: 'bg-violet-500' },
  { bg: 'bg-rose-50 dark:bg-rose-950', text: 'text-rose-800 dark:text-rose-200', dot: 'bg-rose-500' },
  { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-800 dark:text-amber-200', dot: 'bg-amber-500' },
  { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-800 dark:text-blue-200', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-800 dark:text-emerald-200', dot: 'bg-emerald-500' },
]

const tableColorMap = new Map<string, number>()
let colorIndex = 0

function getColor(tableName: string) {
  if (!tableColorMap.has(tableName)) {
    tableColorMap.set(tableName, colorIndex % COLORS.length)
    colorIndex++
  }
  return COLORS[tableColorMap.get(tableName)!]
}

const HANDLE_STYLE = {
  width: 8, height: 8, border: 'none', background: '#525252',
}

export function TableNode({ data }: NodeProps) {
  const { table } = data as TableNodeData
  const color = getColor(table.name)

  return (
    <div className="min-w-[220px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm text-sm">
      <Handle type="target" position={Position.Left}  id="left"  style={{ ...HANDLE_STYLE, top: '50%' }} />
      <Handle type="target" position={Position.Right} id="right" style={{ ...HANDLE_STYLE, top: '50%' }} />
      <Handle type="source" position={Position.Left}  id="left"  style={{ ...HANDLE_STYLE, top: '50%' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...HANDLE_STYLE, top: '50%' }} />

      <div className={`flex items-center gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 ${color.bg}`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`} />
        <span className={`font-medium text-xs ${color.text}`}>{table.name}</span>
      </div>

      {table.fields.map(field => (
        <div
          key={field.name}
          className="flex items-center gap-2 px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
        >
          <div className="flex gap-1 flex-shrink-0">
            {field.isPK && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 font-medium">PK</span>
            )}
            {field.isFK && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">FK</span>
            )}
          </div>
          <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 truncate">{field.name}</span>
          <span className="ml-auto text-[10px] text-neutral-400 dark:text-neutral-500 flex-shrink-0">{field.type}</span>
        </div>
      ))}
    </div>
  )
}