import { toast } from 'sonner'

// A download has to start soon after the click that asked for it; browsers quietly drop
// downloads that start seconds later. So: quick files download straight away, slow ones
// (big batches, print sheets) wait for one more tap on "Save".

const QUICK_MS = 4500 // browsers honour a click for about 5 s

function trigger(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 60_000)
}

export function deliver(blob: Blob, name: string, startedAt: number, what = 'Your file') {
  if (performance.now() - startedAt < QUICK_MS) return trigger(blob, name)
  toast.success(`${what} is ready`, {
    description: name,
    duration: 60_000,
    action: { label: 'Save', onClick: () => trigger(blob, name) },
  })
}
