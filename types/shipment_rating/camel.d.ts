import { SnakeToCamelCase } from '..';
import { ShipmentRatingSnake, ShipmentServiceSnake } from './snake';

export type ShipmentRatingCamel = {
  [K in keyof ShipmentRatingSnake as SnakeToCamelCase<K>]: ShipmentRatingSnake[K];
};

export type ShipmentServiceCamel = {
  [K in keyof ShipmentServiceSnake as SnakeToCamelCase<K>]: ShipmentServiceSnake[K];
};
