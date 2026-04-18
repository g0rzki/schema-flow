export interface Field {
  name: string
  type: string
  isPK: boolean
  isFK: boolean
  references?: {
    table: string
    column: string
  }
}

export interface Table {
  name: string
  fields: Field[]
}

export type RelationType = 'one-to-many' | 'one-to-one' | 'many-to-many'

export interface Relation {
  fromTable: string
  fromField: string
  toTable: string
  toField: string
  type: RelationType
}

export interface Schema {
  tables: Table[]
  relations: Relation[]
}