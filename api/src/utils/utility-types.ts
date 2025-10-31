export type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Lowercase<T>}${SnakeCase<U>}`
    : `${Lowercase<T>}_${SnakeCase<Uncapitalize<U>>}`
  : S

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>
