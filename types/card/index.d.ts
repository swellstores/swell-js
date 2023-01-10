import { CardSnake, InputCreateTokenSnake, TokenResponseSnake } from './snake';
import { CardCamel, InputCreateTokenCamel, TokenResponseCamel } from './camel';

interface InputCreateToken
  extends InputCreateTokenSnake,
    InputCreateTokenCamel {}
interface TokenResponse extends TokenResponseSnake, TokenResponseCamel {}
interface Card extends CardCamel, CardSnake {}
