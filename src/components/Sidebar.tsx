import type { Schema } from '../types/schema'
import { SqlInput } from './SqlInput'
import { ExportButton } from './ExportButton'

const DOTS = [
  'bg-teal-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-blue-500', 'bg-emerald-500',
]

interface SidebarProps {
  sql: string
  setSql: (v: string) => void
  onVisualize: () => void
  onReset: () => void
  onAutoLayout: () => void
  error: string | null
  schema: Schema | null
}

export function Sidebar({ sql, setSql, onVisualize, onReset, onAutoLayout, error, schema }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-y-auto">
      <div className="px-3 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
          schema flow
        </span>
      </div>

      <SqlInput
        value={sql}
        onChange={setSql}
        onVisualize={onVisualize}
        onReset={onReset}
        error={error}
        hasSchema={!!schema}
      />

      {schema && (
        <div className="flex flex-col gap-4 p-3">

          <ExportButton />

          {schema && (
            <button
              onClick={onAutoLayout}
              className="w-full py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Auto layout
            </button>
          )}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">
              Tables ({schema.tables.length})
            </p>
            <ul className="flex flex-col gap-0.5">
              {schema.tables.map((t, i) => (
                <li key={t.name} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-default">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOTS[i % DOTS.length]}`} />
                  {t.name}
                  <span className="ml-auto text-neutral-400 dark:text-neutral-600">
                    {t.fields.length}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {schema.relations.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">
                Relations ({schema.relations.length})
              </p>
              <ul className="flex flex-col gap-0.5">
                {schema.relations.map((r, i) => (
                  <li key={i} className="text-xs text-neutral-500 dark:text-neutral-500 px-2 py-1 font-mono">
                    {r.fromTable} → {r.toTable}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">
              Legend
            </p>
            <ul className="flex flex-col gap-1.5">
              <li className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="w-6 h-px bg-neutral-400 flex-shrink-0" />
                one-to-many
              </li>
              <li className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="w-6 h-px bg-blue-400 flex-shrink-0" />
                one-to-one
              </li>
              <li className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="w-6 border-t border-dashed border-amber-400 flex-shrink-0" />
                many-to-many
              </li>
            </ul>
          </div>

        </div>
      )}
    </aside>
  )
}