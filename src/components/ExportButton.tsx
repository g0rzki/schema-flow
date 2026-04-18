import { useReactFlow } from '@xyflow/react'
import { toPng, toSvg } from 'html-to-image'

function downloadFile(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function ExportButton() {
  const { fitView, getNodes } = useReactFlow()

  async function handleExport(format: 'png' | 'svg') {
    // fit first so transform is updated
    await fitView({ padding: 0.2, duration: 0 })

    // small delay to let DOM settle after fitView
    await new Promise(r => setTimeout(r, 50))

    const nodes = getNodes()
    if (nodes.length === 0) return

    // compute bounding box of all nodes in flow coordinates
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

    // get current transform to convert flow coords → screen coords
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null
    if (!viewport) return

    const transform = viewport.style.transform
    const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)\s*scale\(([^)]+)\)/)
    const scale = match ? parseFloat(match[3]) : 1

    const imgW = Math.ceil(flowW * scale)
    const imgH = Math.ceil(flowH * scale)

    const wrapper = document.querySelector('.react-flow') as HTMLElement | null
    if (!wrapper) return

    const opts = {
      backgroundColor: '#0a0a0a',
      width: imgW,
      height: imgH,
      style: {
        width: `${imgW}px`,
        height: `${imgH}px`,
        transform: `translate(${(pad - minX) * scale}px, ${(pad - minY) * scale}px) scale(${scale})`,
        transformOrigin: '0 0',
      },
      filter: (node: HTMLElement) => {
        // exclude controls and minimap from export
        if (node.classList?.contains('react-flow__controls')) return false
        if (node.classList?.contains('react-flow__minimap')) return false
        if (node.classList?.contains('react-flow__panel')) return false
        return true
      },
    }

    if (format === 'png') {
      const dataUrl = await toPng(viewport, { ...opts, pixelRatio: 2 })
      downloadFile(dataUrl, 'schema-flow.png')
    } else {
      // inject background rect into viewport before capture, remove after
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      const svgEl = viewport.querySelector('svg')
      if (svgEl) {
        bgRect.setAttribute('x', '-99999')
        bgRect.setAttribute('y', '-99999')
        bgRect.setAttribute('width', '999999')
        bgRect.setAttribute('height', '999999')
        bgRect.setAttribute('fill', '#0a0a0a')
        svgEl.prepend(bgRect)
      }
      const dataUrl = await toSvg(viewport, { ...opts, backgroundColor: '#0a0a0a' })
      bgRect.remove()
      downloadFile(dataUrl, 'schema-flow.svg')
    }
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleExport('png')}
        className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        Export PNG
      </button>
      <button
        onClick={() => handleExport('svg')}
        className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        Export SVG
      </button>
    </div>
  )
}