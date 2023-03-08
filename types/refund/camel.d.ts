import { SnakeToCamelCase } from "..";
import { RefundSnake } from "./snake";

export type RefundCamel = {
    [K in keyof RefundSnake as SnakeToCamelCase<K>]: RefundSnake[K];
};