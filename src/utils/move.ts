import isUndefined from './isUndefined';
import isArray from './isArray';

export default <T>(data: T[], from: number, to: number): (T | undefined)[] => {
  if (isArray(data)) {
    if (isUndefined(data[to])) {
      data[to] = undefined as any;
    }
    data.splice(to, 0, data.splice(from, 1)[0]);
    return data;
  }

  return [];
};
