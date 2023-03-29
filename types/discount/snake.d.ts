import { BaseModel } from '..';

interface DiscountSnake extends BaseModel {
  amount?: number;
  rule?: {
    type?: string;
    value_type?: string;
    value_amount?: number;
    product_id?: string;
  };
  type?: string;
}
