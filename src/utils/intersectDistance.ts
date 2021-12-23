import type {
  Cartesian2DCoordinate
} from '@observerly/celestia'

/**
 * intersectDistance()
 * 
 * the distance between coordinate { x_1, y_1 } and coordinate { x_n, y_n }
 * 
 * @param coordinate
 * @param coordinate
 * @returns distance between position i and position j
 */
export const intersectDistance = (i: Cartesian2DCoordinate, j: Cartesian2DCoordinate): number => {
  return Math.sqrt((i.x - j.x) ** 2 + (i.y - j.y) ** 2)
}