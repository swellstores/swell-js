import type { BaseModel } from '../index.js';

export interface User extends BaseModel {
  name?: string;
  email?: string;
}
