import { GiftcardDebitSnake, GiftcardSnake } from './snake';
import { GiftcardDebitCamel, GiftcardCamel } from './camel';

export interface GiftcardDebit extends GiftcardDebitSnake, GiftcardDebitCamel {}
export interface Giftcard extends GiftcardSnake, GiftcardCamel {}
