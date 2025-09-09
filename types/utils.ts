export interface MakeCase<Snake, Camel> {
  snake: Snake;
  camel: Camel;
}

export type Replace<T, U extends Partial<Record<keyof T, unknown>>> = Omit<
  T,
  keyof U
> &
  U;
