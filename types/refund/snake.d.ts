import { BaseModel } from ".."

import { Order } from '../order'
import { Payment } from '../payment'
import { Subscription } from '../subscription'

export interface RefundSnake extends BaseModel {

    amount?: number
    currency?: string
    currency_rate?: number
    date_async_update?: string
    error: {
        code?: string
        message?: string
    }
    method?: 'card' | 'account' | 'amazon' | 'paypal'
    number?: string
    order?: Order
    order_id?: string
    parent: Payment
    parent_id?: string
    reason?: string
    reason_message?: string
    status?: string
    subscription: Subscription
    subscription_id?: string
    success?: boolean
    transaction_id?: string
}