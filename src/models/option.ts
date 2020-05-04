export interface Option {
  readonly flags: string
  readonly description: string
  readonly required: boolean
  readonly defaultValue?: boolean | string
}
