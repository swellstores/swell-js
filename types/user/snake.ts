import type { BaseModel } from '..';

export interface User extends BaseModel {
  name?: string;
  email?: string;
}
