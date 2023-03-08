import { CartSnake, CartItemSnake, CartItemOptionsSnake, CartGiftCardItemSnake, CartShipmentRatingSnake, CartShippingSnake } from './snake';
import { CartCamel, CartItemCamel, CartItemOptionsCamel, CartGiftCardItemCamel, CartShipmentRatingCamel, CartShippingCamel } from './camel';

export interface Cart extends CartSnake, CartCamel { }
export interface CartItem extends CartItemSnake, CartItemCamel { }
export interface CartItemOption extends CartItemOptionsSnake, CartItemOptionsCamel { }
export interface CartGiftCardItem extends CartGiftCardItemSnake, CartGiftCardItemCamel { }
export interface CartShipmentRating extends CartShipmentRatingCamel, CartShipmentRatingSnake { }
export interface CartShipping extends CartShippingCamel, CartShippingSnake { }