import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'

const NODE_WIDTH = 220
const FIELD_HEIGHT = 28
const HEADER_HEIGHT = 36

export function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: 'LR',
    ranksep: 180,
    nodesep: 80,
    marginx: 60,
    marginy: 60,
  })

  nodes.forEach(n => {
    const fields = (n.data as any)?.table?.fields?.length ?? 4
    const h = HEADER_HEIGHT + fields * FIELD_HEIGHT
    g.setNode(n.id, { width: NODE_WIDTH, height: h })
  })

  edges.forEach(e => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map(n => {
    const pos = g.node(n.id)
    return { ...n, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - pos.height / 2 } }
  })
}