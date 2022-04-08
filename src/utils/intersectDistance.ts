import type { CartesianCoordinate } from '@observerly/polaris'

/**
 * intersectDistance()
 *
 * the distance between coordinate { x_1, y_1 } and coordinate { x_n, y_n }
 *
 * @param coordinate
 * @param coordinate
 * @returns distance between position i and position j
 */
export const intersectDistance = (i: CartesianCoordinate, j: CartesianCoordinate): number => {
  return Math.sqrt((i.x - j.x) ** 2 + (i.y - j.y) ** 2)
}
