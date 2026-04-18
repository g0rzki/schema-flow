import { useCallback, useState } from 'react'
import type { Edge, Node } from '@xyflow/react'
import { parseSql } from '../lib/sqlParser'
import type { Schema } from '../types/schema'

const TABLE_WIDTH = 220
const TABLE_HEADER = 36
const FIELD_HEIGHT = 28
const COL_GAP = 80
const ROW_GAP = 60

function buildNodes(schema: Schema): Node[] {
  return schema.tables.map((table, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    return {
      id: table.name,
      type: 'tableNode',
      position: {
        x: col * (TABLE_WIDTH + COL_GAP),
        y: row * (TABLE_HEADER + table.fields.length * FIELD_HEIGHT + ROW_GAP),
      },
      data: { table },
    }
  })
}

function buildEdges(schema: Schema): Edge[] {
  return schema.relations.map((rel, i) => ({
    id: `e-${i}-${rel.fromTable}-${rel.fromField}`,
    source: rel.fromTable,
    target: rel.toTable,
    label: `${rel.fromField} → ${rel.toField}`,
    type: 'smoothstep',
    animated: false,
    style: { strokeWidth: 1.5 },
  }))
}

export function useSchema() {
  const [sql, setSql] = useState('')
  const [schema, setSchema] = useState<Schema | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [error, setError] = useState<string | null>(null)

  const visualize = useCallback(() => {
    if (!sql.trim()) return
    try {
      const parsed = parseSql(sql)
      if (parsed.tables.length === 0) {
        setError('No valid CREATE TABLE statements found.')
        return
      }
      setSchema(parsed)
      setNodes(buildNodes(parsed))
      setEdges(buildEdges(parsed))
      setError(null)
    } catch {
      setError('Failed to parse SQL. Check your syntax.')
    }
  }, [sql])

  const reset = useCallback(() => {
    setSql('')
    setSchema(null)
    setNodes([])
    setEdges([])
    setError(null)
  }, [])

  return { sql, setSql, schema, nodes, edges, error, visualize, reset }
}