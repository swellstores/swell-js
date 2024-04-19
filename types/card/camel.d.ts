import { ConvertSnakeToCamelCase } from '..';
import { CardSnake, InputCreateTokenSnake, TokenResponseSnake } from './snake';

export type CardCamel = ConvertSnakeToCamelCase<CardSnake>;

export type InputCreateTokenCamel =
  ConvertSnakeToCamelCase<InputCreateTokenSnake>;

export type TokenResponseCamel = ConvertSnakeToCamelCase<TokenResponseSnake>;
