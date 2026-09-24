import type { ConvertSnakeToCamelCase } from '../index.js';
import type { Replace } from '../utils.js';

import type { ShipmentRating, ShipmentService } from './snake.js';

export type ShipmentRatingCamel = ConvertSnakeToCamelCase<
  Replace<
    ShipmentRating,
    {
      services?: ShipmentServiceCamel[];
    }
  >
>;

export type ShipmentServiceCamel = ConvertSnakeToCamelCase<ShipmentService>;
