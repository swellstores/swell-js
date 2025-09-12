import type { ConvertSnakeToCamelCase } from '..';
import type { Replace } from '../utils';

import type { ShipmentRating, ShipmentService } from './snake';

export type ShipmentRatingCamel = ConvertSnakeToCamelCase<
  Replace<
    ShipmentRating,
    {
      services?: ShipmentServiceCamel[];
    }
  >
>;

export type ShipmentServiceCamel = ConvertSnakeToCamelCase<ShipmentService>;
