import type { Box } from './types';

export const isCustomEvent = (v: any): v is CustomEvent => 'detail' in v;

export function collides(one: Box, two: Box) {
  const [one_ulx, one_uly, one_lrx, one_lry] = one;
  const [two_ulx, two_uly, two_lrx, two_lry] = two;

  {
    const points = [
      [one_ulx, one_uly],
      [one_lrx, one_uly],
      [one_lrx, one_lry],
      [one_ulx, one_lry],
    ];
    if (points.some(([x, y]) => x >= two_ulx && y >= two_uly && x <= two_lrx && y <= two_lry)) {
      return true;
    }
  }

  const points = [
    [two_ulx, two_uly],
    [two_lrx, two_uly],
    [two_lrx, two_lry],
    [two_ulx, two_lry],
  ];
  return points.some(([x, y]) => x >= one_ulx && y >= one_uly && x <= one_lrx && y <= one_lry);
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}
