import { Coupon } from "../coupon"
import { Promotion } from "../promotion"

export interface PurchaseLinkDiscountSnake {
    id?: string;
    type?: 'coupon' | 'promo'
    rule?: any;
    amount?: number
}

export interface PurchaseLinkSnake {
    name?: string
    active?: boolean
    coupon?: Coupon
    coupon_id?: string
    currency?: string
    discount_total?: number
    discounts?: PurchaseLinkDiscountSnake[]
    grand_total?: number
    item_discount?: number
    items?: any[]
    metadata?: any
    promotion_ids?: string[]
    promotions?: Promotion[]
    sub_total?: number
}