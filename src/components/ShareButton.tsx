import { useState } from 'react'

interface ShareButtonProps {
  onCopy: () => void
}

export function ShareButton({ onCopy }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      {copied ? '✓ Link copied!' : 'Copy share link'}
    </button>
  )
}