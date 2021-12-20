import { computed, ref, ComputedRef, Ref } from 'vue'

import { onKeyStroke } from '@vueuse/core'

import {
  getSolarEquatorialCoordinate,
  convertEquatorialToHorizontal,
  stereoProjectHorizontalToCartesian2DCoordinate,
  Cartesian2DCoordinate,
  SunObservedRelative
} from '@observerly/celestia'

export type Sun = SunObservedRelative

export interface UseSunOptions {
  /**
   * 
   * Longitude coordinate {in degrees}
   * 
   */
  longitude: ComputedRef<number>
  /**
   * 
   * Latitude coordinate {in degrees}
   * 
   */
  latitude: ComputedRef<number>
  /**
   * 
   * Azimuthal Offset
   * 
   */
  azOffset: Ref<number>
  /**
   * 
   * Altitudinal Offset
   * 
   */
  altOffset: Ref<number>
  /**
   * 
   * Dimenions (Width & Height) of the Projection Surface:
   * 
   */
  dimensions: ComputedRef<Cartesian2DCoordinate>
  /**
   * 
   * 
   * Screen Resolution
   * 
   */
  resolution: ComputedRef<number>
  /**
   * 
   * Datetime
   * 
   */
  datetime: Ref<Date>
  /**
   * 
   * is the frame being dragged?
   * 
   */
  isDragging: Ref<boolean>
  /**
   * 
   * current { x } pointer position
   * 
   */
  x: Ref<number>
  /**
   * 
   * current { y } pointer position
   * 
   */
  y: Ref<number>
  /**
   * 
   * show constellations boolean
   * 
   */
  show: boolean
}

export const useSun = (
  options: UseSunOptions
) => {
  const {
    longitude,
    latitude,
    azOffset,
    altOffset,
    dimensions,
    resolution,
    datetime,
    isDragging,
    x,
    y,
    show
  } = options

  // Show the Sun:
  const showSun = ref<boolean>(show)

  const toggleSun = () => {
    showSun.value = !showSun.value
  }

  // Toggle the Sun on keystroke of "S":
  onKeyStroke(
    'S',
    (e: KeyboardEvent) => {
      e.preventDefault()
      showSun.value = !showSun.value
    },
    {
      target: window
    }
  )

  const sun = computed<Sun>(() => {
    const width = dimensions.value.x

    const height = dimensions.value.y
    
    const { ra, dec } = getSolarEquatorialCoordinate(datetime.value)

    let { alt, az } = convertEquatorialToHorizontal(
      {
        ra: ra,
        dec: dec
      },
      {
        longitude: longitude.value,
        latitude: latitude.value,
      },
      datetime.value
    )

    alt -= altOffset.value

    az -= azOffset.value

    const { x, y } = stereoProjectHorizontalToCartesian2DCoordinate(
      {
        alt: alt,
        az: az
      },
      width,
      height
    )

    return {
      ra: ra,
      dec: dec,
      alt: alt,
      az: az,
      x: x,
      y: y
    }
  })

  // Draw the Sun to the Canvas:
  const drawSun = (
    ctx: Ref<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>,
    radius: number,
    strokeStyle: string,
    fillStyle: string
  ): void => {
    const { x, y } = sun.value

    const precision = resolution.value

    // Draw the Sun on the canvas.ctx:
    if (ctx.value && x >= 0 && y >= 0) {
      ctx.value.beginPath()
      ctx.value.arc(x, y, radius * precision * 1.5, 0, 2 * Math.PI, false)
      ctx.value.strokeStyle = strokeStyle
      ctx.value.stroke()
      ctx.value.beginPath()
      ctx.value.arc(x, y, radius * 0.25 * precision * 1.5, 0, 2 * Math.PI, false)
      ctx.value.fillStyle = fillStyle
      ctx.value.fill()
    }
  }

  return {
    sun,
    drawSun,
    toggleSun,
    show: showSun
  }
}

export type UseSunReturn = ReturnType<typeof useSun>

export interface UseSunProps extends Partial<UseSunReturn> {}