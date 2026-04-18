import { useCallback, useState } from 'react'
import { applyNodeChanges } from '@xyflow/react'
import type { Edge, Node, NodeChange } from '@xyflow/react'
import { parseSql } from '../lib/sqlParser'
import { applyDagreLayout } from '../lib/layout'
import type { RelationType, Schema } from '../types/schema'

const TABLE_WIDTH = 220

const RELATION_STYLE: Record<RelationType, { stroke: string; strokeDasharray?: string }> = {
  'one-to-many':  { stroke: '#a3a3a3' },
  'one-to-one':   { stroke: '#60a5fa' },
  'many-to-many': { stroke: '#f59e0b', strokeDasharray: '6 3' },
}

const RELATION_MARKER_END: Record<RelationType, { type: 'arrowclosed'; width: number; height: number; color: string }> = {
  'one-to-many':  { type: 'arrowclosed', width: 14, height: 14, color: '#a3a3a3' },
  'one-to-one':   { type: 'arrowclosed', width: 14, height: 14, color: '#60a5fa' },
  'many-to-many': { type: 'arrowclosed', width: 14, height: 14, color: '#f59e0b' },
}

const RELATION_MARKER_START: Record<RelationType, { type: 'arrow'; width: number; height: number; color: string } | undefined> = {
  'one-to-many':  undefined,
  'one-to-one':   undefined,
  'many-to-many': { type: 'arrow', width: 14, height: 14, color: '#f59e0b' },
}

function buildNodes(schema: Schema): Node[] {
  return schema.tables.map((table, i) => ({
    id: table.name,
    type: 'tableNode',
    position: { x: i * 300, y: 0 },
    data: { table },
  }))
}

function buildEdges(schema: Schema, nodes: Node[]): Edge[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return schema.relations.map((rel, i) => {
    const srcX = (nodeMap.get(rel.fromTable)?.position.x ?? 0) + TABLE_WIDTH / 2
    const tgtX = (nodeMap.get(rel.toTable)?.position.x ?? 0) + TABLE_WIDTH / 2
    const srcRight = srcX > tgtX

    return {
      id: `e-${i}-${rel.fromTable}-${rel.fromField}`,
      source: rel.fromTable,
      sourceHandle: srcRight ? 'left' : 'right',
      target: rel.toTable,
      targetHandle: srcRight ? 'right' : 'left',
      type: 'smoothstep',
      animated: false,
      style: { strokeWidth: 1.5, ...RELATION_STYLE[rel.type] },
      markerEnd: RELATION_MARKER_END[rel.type],
      markerStart: RELATION_MARKER_START[rel.type],
      label: rel.type === 'many-to-many' ? 'M:N' : rel.type === 'one-to-one' ? '1:1' : undefined,
      labelStyle: { fontSize: 10, fill: '#737373' },
      labelBgStyle: { fill: 'transparent' },
    }
  })
}

export function useSchema() {
  const [sql, setSql] = useState('')
  const [schema, setSchema] = useState<Schema | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [error, setError] = useState<string | null>(null)

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(prev => {
        const updated = applyNodeChanges(changes, prev)
        setEdges(e => e.length > 0 && schema ? buildEdges(schema, updated) : e)
        return updated
      })
    },
    [schema]
  )

  const visualize = useCallback(() => {
    if (!sql.trim()) return
    try {
      const parsed = parseSql(sql)
      if (parsed.tables.length === 0) {
        setError('No valid CREATE TABLE statements found.')
        return
      }
      const rawNodes = buildNodes(parsed)
      const rawEdges = buildEdges(parsed, rawNodes)
      const laidNodes = applyDagreLayout(rawNodes, rawEdges)
      setSchema(parsed)
      setNodes(laidNodes)
      setEdges(buildEdges(parsed, laidNodes))
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to parse SQL. Check your syntax.')
    }
  }, [sql])

  const autoLayout = useCallback(() => {
    if (!schema) return
    const laidNodes = applyDagreLayout(nodes, edges)
    setNodes(laidNodes)
    setEdges(buildEdges(schema, laidNodes))
  }, [nodes, edges, schema])

  const reset = useCallback(() => {
    setSql('')
    setSchema(null)
    setNodes([])
    setEdges([])
    setError(null)
  }, [])

  return { sql, setSql, schema, nodes, edges, error, visualize, reset, onNodesChange, autoLayout }
}