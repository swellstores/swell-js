import { BaseModel, Order, Subscription } from ".."

interface PromotionSnake extends BaseModel {
    name?: string
    active?: boolean
    currency?: string
    date_end?: string
    date_start?: string
    description?: string
    discount_group?: string
    discounts?: any[]
    exclusions?: any[]
    limit_account_groups?: any[]
    limit_account_uses?: number
    limit_uses?: number
    orders?: Order[]
    subscriptions?: Subscription[]
    use_count?: number
    uses?: any[]
}