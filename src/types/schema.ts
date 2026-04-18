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

export interface Relation {
  fromTable: string
  fromField: string
  toTable: string
  toField: string
}

export interface Schema {
  tables: Table[]
  relations: Relation[]
}