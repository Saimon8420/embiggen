import { useRef, useState } from 'react'

// Fluid before/after compare. Both layers fill the container; the "after" (AI
// result) is the top layer, clipped to reveal it on the RIGHT of the divider,
// so the left shows the original and the right shows the upscaled result.
export function BeforeAfterSlider({ before, after }: { before: ImageData; after: ImageData }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50) // divider position, percent from left

  function setCanvas(c: HTMLCanvasElement | null, img: ImageData) {
    if (!c) return
    c.width = img.width; c.height = img.height
    c.getContext('2d')!.putImageData(img, 0, 0)
  }

  function move(clientX: number) {
    const r = wrapRef.current!.getBoundingClientRect()
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full touch-none select-none overflow-hidden rounded-md border bg-muted"
      style={{ maxWidth: after.width, aspectRatio: `${after.width} / ${after.height}` }}
      onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); move(e.clientX) }}
      onPointerMove={(e) => { if (e.buttons) move(e.clientX) }}
    >
      {/* before (original; CSS-stretched to the result size to align) */}
      <canvas ref={(c) => setCanvas(c, before)} className="absolute inset-0 h-full w-full" />
      {/* after (AI result), clipped to the right of the divider */}
      <canvas ref={(c) => setCanvas(c, after)} className="absolute inset-0 h-full w-full" style={{ clipPath: `inset(0 0 0 ${pos}%)` }} />
      {/* divider + handle */}
      <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" style={{ left: `${pos}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs text-black shadow">↔</div>
      </div>
      <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">Before</span>
      <span className="pointer-events-none absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">After</span>
    </div>
  )
}
