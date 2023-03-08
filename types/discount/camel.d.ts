import { SnakeToCamelCase } from "..";
import { DiscountSnake } from "./snake";

export type DiscountCamel = {
    [K in keyof DiscountSnake as SnakeToCamelCase<K>]: DiscountSnake[K];
}