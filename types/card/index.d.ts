import { CardSnake, InputCreateTokenSnake, TokenResponseSnake } from './snake';
import { CardCamel, InputCreateTokenCamel, TokenResponseCamel } from './camel';

export interface InputCreateToken
  extends InputCreateTokenSnake,
    InputCreateTokenCamel {}

export interface TokenResponse extends TokenResponseSnake, TokenResponseCamel {}
export interface Card extends CardCamel, CardSnake {}
