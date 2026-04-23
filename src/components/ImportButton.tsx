import { useRef } from 'react'

interface ImportButtonProps {
  onImport: (sql: string) => void
}

export function ImportButton({ onImport }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClick() {
    inputRef.current?.click()
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      onImport(content)
    }
    reader.readAsText(file)

    // reset input so the same file can be re-imported
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".sql"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={handleClick}
        className="w-full py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        Import .sql
      </button>
    </>
  )
}