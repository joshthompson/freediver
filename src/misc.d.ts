type TupleOf<T, N extends number, R extends unknown[] = []> =
  R['length'] extends N ? R : TupleOf<T, N, [...R, T]>

type RecursivePartial<T> = {
  [P in keyof T]?:
    T[P] extends (infer U)[]
      ? RecursivePartial<U>[]
      : T[P] extends object | undefined
        ? RecursivePartial<T[P]>
        : T[P]
}

type Rect = {
  x: number
  y: number
  width: number
  height: number
}
