export interface Settings {
  [key: string]:
    | string
    | number
    | boolean
    | object
    | Settings
    | Settings[]
    | null;
}
