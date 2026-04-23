import { useCallback, useEffect, useState } from 'react'
import { applyNodeChanges } from '@xyflow/react'
import type { Edge, Node, NodeChange } from '@xyflow/react'
import { parseSql } from '../lib/sqlParser'
import { applyDagreLayout } from '../lib/layout'
import { DEFAULT_SQL } from '../lib/defaultSchema'
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

async function encodeSql(sql: string): Promise<string> {
  const stream = new CompressionStream('deflate-raw')
  const writer = stream.writable.getWriter()
  writer.write(new TextEncoder().encode(sql))
  writer.close()
  const compressed = await new Response(stream.readable).arrayBuffer()
  return btoa(String.fromCharCode(...new Uint8Array(compressed)))
}

async function decodeSql(hash: string): Promise<string | null> {
  try {
    const bytes = Uint8Array.from(atob(hash), c => c.charCodeAt(0))
    const stream = new DecompressionStream('deflate-raw')
    const writer = stream.writable.getWriter()
    writer.write(bytes)
    writer.close()
    const buf = await new Response(stream.readable).arrayBuffer()
    return new TextDecoder().decode(buf)
  } catch {
    return null
  }
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

function parseAndLayout(rawSql: string): { schema: Schema; nodes: Node[]; edges: Edge[] } | null {
  try {
    const schema = parseSql(rawSql)
    if (schema.tables.length === 0) return null
    const rawNodes = buildNodes(schema)
    const rawEdges = buildEdges(schema, rawNodes)
    const nodes = applyDagreLayout(rawNodes, rawEdges)
    const edges = buildEdges(schema, nodes)
    return { schema, nodes, edges }
  } catch {
    return null
  }
}

export function useSchema() {
  const [sql, setSql] = useState(DEFAULT_SQL)
  const [schema, setSchema] = useState<Schema | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      decodeSql(hash).then(decoded => {
        const initial = decoded ?? DEFAULT_SQL
        setSql(initial)
        const result = parseAndLayout(initial)
        if (result) {
          setSchema(result.schema)
          setNodes(result.nodes)
          setEdges(result.edges)
        }
      })
    } else {
      const result = parseAndLayout(DEFAULT_SQL)
      if (result) {
        setSchema(result.schema)
        setNodes(result.nodes)
        setEdges(result.edges)
      }
    }
  }, [])

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

  const visualize = useCallback(async () => {
    if (!sql.trim()) return
    const result = parseAndLayout(sql)
    if (!result) {
      setError('Failed to parse SQL. Check your syntax.')
      return
    }
    setSchema(result.schema)
    setNodes(result.nodes)
    setEdges(result.edges)
    setError(null)
    window.location.hash = await encodeSql(sql)
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
    window.location.hash = ''
  }, [])

  const importSql = useCallback((content: string) => {
    setSql(content)
    const result = parseAndLayout(content)
    if (!result) {
      setError('Failed to parse SQL. Check your syntax.')
      return
    }
    setSchema(result.schema)
    setNodes(result.nodes)
    setEdges(result.edges)
    setError(null)
  }, [])

  const copyShareLink = useCallback(async () => {
    const hash = await encodeSql(sql)
    const url = `${window.location.origin}${window.location.pathname}#${hash}`
    navigator.clipboard.writeText(url)
  }, [sql])

  return { sql, setSql, schema, nodes, edges, error, visualize, reset, onNodesChange, autoLayout, copyShareLink, importSql }
}