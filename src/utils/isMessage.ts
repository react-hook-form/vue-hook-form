import isString from "../utils/isString";
import isObject from "../utils/isObject";
import { Message } from "../types/form";

export default (value: unknown): value is Message =>
  isString(value) || isObject(value);
