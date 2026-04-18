import type { Field, Relation, Schema, Table } from '../types/schema'

const INLINE_PK = /primary\s+key/i
const INLINE_FK = /references\s+(\w+)\s*\((\w+)\)/i
const TABLE_BLOCK = /create\s+table\s+(?:if\s+not\s+exists\s+)?["'`]?(\w+)["'`]?\s*\(([^;]*)\)/gi
const CONSTRAINT_PK = /^\s*(?:constraint\s+\w+\s+)?primary\s+key\s*\(([^)]+)\)/i
const CONSTRAINT_FK = /^\s*(?:constraint\s+\w+\s+)?foreign\s+key\s*\(([^)]+)\)\s*references\s+["'`]?(\w+)["'`]?\s*\(([^)]+)\)/i

function splitFields(body: string): string[] {
  const fields: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of body) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      fields.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur.trim()) fields.push(cur.trim())
  return fields
}

export function parseSql(sql: string): Schema {
  const tables: Table[] = []
  const relations: Relation[] = []

  let match: RegExpExecArray | null
  TABLE_BLOCK.lastIndex = 0

  while ((match = TABLE_BLOCK.exec(sql)) !== null) {
    const tableName = match[1]
    const body = match[2]
    const rawFields = splitFields(body)

    const fields: Field[] = []
    const tablePKs = new Set<string>()
    const tableFKs: Array<{ from: string; toTable: string; toColumn: string }> = []

    // first pass — collect table-level constraints
    for (const raw of rawFields) {
      const pkMatch = raw.match(CONSTRAINT_PK)
      if (pkMatch) {
        pkMatch[1].split(',').map(s => s.trim()).forEach(col => tablePKs.add(col))
        continue
      }
      const fkMatch = raw.match(CONSTRAINT_FK)
      if (fkMatch) {
        tableFKs.push({
          from: fkMatch[1].trim(),
          toTable: fkMatch[2].trim(),
          toColumn: fkMatch[3].trim(),
        })
      }
    }

    // second pass — parse column definitions
    for (const raw of rawFields) {
      if (CONSTRAINT_PK.test(raw) || CONSTRAINT_FK.test(raw)) continue

      const tokens = raw.trim().split(/\s+/)
      if (tokens.length < 2) continue

      const name = tokens[0].replace(/["'`]/g, '')
      const type = tokens[1].toUpperCase()

      const isPK = INLINE_PK.test(raw) || tablePKs.has(name)
      const inlineFK = raw.match(INLINE_FK)
      const tableFK = tableFKs.find(fk => fk.from === name)

      let isFK = false
      let references: Field['references']

      if (inlineFK) {
        isFK = true
        references = { table: inlineFK[1], column: inlineFK[2] }
      } else if (tableFK) {
        isFK = true
        references = { table: tableFK.toTable, column: tableFK.toColumn }
      }

      fields.push({ name, type, isPK, isFK, references })

      if (isFK && references) {
        relations.push({
          fromTable: tableName,
          fromField: name,
          toTable: references.table,
          toField: references.column,
        })
      }
    }

    tables.push({ name: tableName, fields })
  }

  return { tables, relations }
}