const PLACEHOLDER = `CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT
);`

interface SqlInputProps {
  value: string
  onChange: (v: string) => void
  onVisualize: () => void
  onReset: () => void
  error: string | null
  hasSchema: boolean
}

export function SqlInput({ value, onChange, onVisualize, onReset, error, hasSchema }: SqlInputProps) {
  return (
    <div className="flex flex-col gap-2 p-3 border-b border-neutral-200 dark:border-neutral-800">
      <textarea
        className="w-full h-36 resize-none font-mono text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        placeholder={PLACEHOLDER}
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
      />
      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={onVisualize}
          className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-80 transition-opacity"
        >
          Visualize
        </button>
        {hasSchema && (
          <button
            onClick={onReset}
            className="px-4 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}