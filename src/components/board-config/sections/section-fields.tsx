import { BoolField, NumberField } from '@/components/ui/form-field'

type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T]
type BoolKeys<T> = { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T]

export type FieldSpec<T> =
  | { kind: 'number'; key: NumericKeys<T>; label: string }
  | { kind: 'bool'; key: BoolKeys<T>; label: string }

export interface SectionFieldsProps<T> {
  value: T
  fields: readonly FieldSpec<T>[]
  onPatch: (partial: Partial<T>) => void
}

export const SectionFields = <T,>({ value, fields, onPatch }: SectionFieldsProps<T>) =>
  fields.map((field) => {
    const patch = (next: number | boolean) => {
      onPatch({ [field.key]: next } as Partial<T>)
    }
    return field.kind === 'number' ? (
      <NumberField
        key={String(field.key)}
        label={field.label}
        value={value[field.key] as number}
        onChange={patch}
      />
    ) : (
      <BoolField
        key={String(field.key)}
        label={field.label}
        value={value[field.key] as boolean}
        onChange={patch}
      />
    )
  })
