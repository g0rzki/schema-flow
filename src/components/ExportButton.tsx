import { useReactFlow } from '@xyflow/react'
import { toPng } from 'html-to-image'

function downloadFile(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function ExportButton() {
  const { fitView, getNodes } = useReactFlow()

  async function handleExport() {
    await fitView({ padding: 0.2, duration: 0 })
    await new Promise(r => setTimeout(r, 50))

    const nodes = getNodes()
    if (nodes.length === 0) return

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const n of nodes) {
      const w = (n.measured?.width ?? n.width ?? 220)
      const h = (n.measured?.height ?? n.height ?? 100)
      minX = Math.min(minX, n.position.x)
      minY = Math.min(minY, n.position.y)
      maxX = Math.max(maxX, n.position.x + w)
      maxY = Math.max(maxY, n.position.y + h)
    }

    const pad = 40
    const flowW = maxX - minX + pad * 2
    const flowH = maxY - minY + pad * 2

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null
    if (!viewport) return

    const transform = viewport.style.transform
    const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)\s*scale\(([^)]+)\)/)
    const scale = match ? parseFloat(match[3]) : 1

    const imgW = Math.ceil(flowW * scale)
    const imgH = Math.ceil(flowH * scale)

    const dataUrl = await toPng(viewport, {
      backgroundColor: '#0a0a0a',
      width: imgW,
      height: imgH,
      pixelRatio: 2,
      style: {
        width: `${imgW}px`,
        height: `${imgH}px`,
        transform: `translate(${(pad - minX) * scale}px, ${(pad - minY) * scale}px) scale(${scale})`,
        transformOrigin: '0 0',
      },
      filter: (node: HTMLElement) => {
        if (node.classList?.contains('react-flow__controls')) return false
        if (node.classList?.contains('react-flow__minimap')) return false
        if (node.classList?.contains('react-flow__panel')) return false
        return true
      },
    })

    downloadFile(dataUrl, 'schema-flow.png')
  }

  return (
    <button
      onClick={handleExport}
      className="w-full py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      Export PNG
    </button>
  )
}