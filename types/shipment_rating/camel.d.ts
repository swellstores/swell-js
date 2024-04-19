import { ConvertSnakeToCamelCase } from '..';
import { ShipmentRatingSnake, ShipmentServiceSnake } from './snake';

export type ShipmentRatingCamel = ConvertSnakeToCamelCase<ShipmentRatingSnake>;

export type ShipmentServiceCamel =
  ConvertSnakeToCamelCase<ShipmentServiceSnake>;
