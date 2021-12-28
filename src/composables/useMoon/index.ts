import { computed, ref, ComputedRef, Ref } from 'vue'

import { onKeyStroke } from '@vueuse/core'

import {
  getMoon,
  getLunarEquatorialCoordinate,
  convertEquatorialToHorizontal,
  stereoProjectHorizontalToCartesian2DCoordinate,
  Cartesian2DCoordinate,
  MoonObservedRelative
} from '@observerly/celestia'

import { drawBody } from '@/utils'

export type Moon = MoonObservedRelative

export interface UseMoonOptions {
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
   * show the moon boolean
   * 
   */
  show: boolean
}


/**
 * Reactive useMoon()
 * Returns the reactive Moon as a function of datetime
 *
 * @param options of type UseMoonOptions
 * @output the moon of type Moon, drawMoon canvas method and show boolean
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useMoon = (options: UseMoonOptions) => {
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

  // Show the Moon:
  const showMoon = ref<boolean>(show)

  const toggleMoon = () => {
    showMoon.value = !showMoon.value
  }

  // Toggle the Moon on keystroke of "M":
  onKeyStroke(
    'M',
    (e: KeyboardEvent) => {
      e.preventDefault()
      toggleMoon()
    },
    {
      target: window
    }
  )

  const moon = computed<MoonObservedRelative>(() => {
    const width = dimensions.value.x

    const height = dimensions.value.y

    const { ra, dec } = getLunarEquatorialCoordinate(datetime.value)

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

    const moon = getMoon(datetime.value)

    return {
      ...moon,
      ra,
      dec,
      alt,
      az,
      x,
      y
    }
  })

  // Draw the Moon to the Canvas:
  const drawMoon = (
    ctx: Ref<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>
  ): void => {
    const { angularDiameter, x, y } = moon.value

    const precision = resolution.value

    // Calculate the Apparent Angular Diameter as observed from our observed location:
    const radius = 10 * angularDiameter * precision

    // Draw the Moon HTMLImageElement on the canvas.ctx:
    if (x >= 0 && y >= 0 && ctx.value) {
      drawBody(ctx.value, x, y, radius, '#FFFFFF', precision)
    }
  }

  return {
    moon,
    drawMoon,
    show: showMoon
  }
}

export type UseMoonReturn = ReturnType<typeof useMoon>

export interface UseMoonProps extends Partial<UseMoonReturn> {}