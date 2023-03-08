import { ShipmentRatingCamel, ShipmentServiceCamel } from "./camel";
import { ShipmentRatingSnake, ShipmentServiceSnake } from "./snake";

export interface ShipmentRating extends ShipmentRatingCamel, ShipmentRatingSnake { }
export interface ShipmentService extends ShipmentServiceCamel, ShipmentServiceSnake { }