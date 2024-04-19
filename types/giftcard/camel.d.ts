import { ConvertSnakeToCamelCase } from '..';

import { GiftcardDebitSnake, GiftcardSnake } from './snake';

export type GiftcardDebitCamel = ConvertSnakeToCamelCase<GiftcardDebitSnake>;
export type GiftcardCamel = ConvertSnakeToCamelCase<GiftcardSnake>;
