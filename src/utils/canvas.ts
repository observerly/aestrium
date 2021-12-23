import { Cartesian2DCoordinate } from '@observerly/celestia'

/**
 * 
 * drawBody()
 * 
 * @param ctx 
 * @param x 
 * @param y 
 * @param radius 
 * @param fillStyle 
 * @param scaling 
 */
export const drawBody = (
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null,
  x: number,
  y: number,
  radius: number,
  fillStyle: string,
  scaling: number
): void => {
  if (ctx) {
    ctx.beginPath()
    ctx.arc(x, y, radius * scaling, 0, 2 * Math.PI, false)
    ctx.fillStyle = fillStyle
    ctx.fill()
  }
}

/**
 * 
 * drawClosedPath()
 * 
 * @param ctx 
 * @param path 
 * @param lineWidth 
 * @param strokeStyle 
 */
export const drawClosedPath = (
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null,
  path: Path2D,
  lineWidth: number,
  strokeStyle: string
): void => {
  if (ctx) {
    ctx.beginPath()
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = lineWidth
    ctx.stroke(path)
    ctx.closePath()
  }
}

/**
 * 
 * drawLine()
 * 
 * @param ctx 
 * @param moveTo 
 * @param lineTo 
 */
export const drawLine = (
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null,
  moveTo: Cartesian2DCoordinate,
  lineTo: Cartesian2DCoordinate
): void => {
  if (ctx) {
    ctx.beginPath()
    ctx.moveTo(moveTo.x, moveTo.y)
    ctx.lineTo(lineTo.x, lineTo.y)
    ctx.stroke()
  }
}
