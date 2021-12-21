import { computed, ref, ComputedRef, Ref } from 'vue'

import { onKeyStroke } from '@vueuse/core'

import {
  convertEquatorialToHorizontal,
  getEclipticCoordinates,
  stereoProjectHorizontalToCartesian2DCoordinate,
  Cartesian2DCoordinate,
  Cartesian2DHorizontalCoordinate,
  EquatorialCoordinate
} from '@observerly/celestia'

export interface UseEclipticOptions {
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
   * show the ecliptic boolean
   * 
   */
  show: boolean
}

/**
 * Reactive useEcliptic()
 * Returns the reactive ecliptic for the current year
 *
 * @param options of type UseEclipticOptions
 * @output
 */
export const useEcliptic = (options: UseEclipticOptions) => {
  const {
    longitude,
    latitude,
    azOffset,
    altOffset,
    dimensions,
    resolution,
    datetime,
    show
  } = options

  // Show the Sun:
  const showEcliptic = ref<boolean>(show)

  const toggleEcliptic = () => {
    showEcliptic.value = !showEcliptic.value
  }

  onKeyStroke(
    'E',
    (e: KeyboardEvent) => {
      e.preventDefault()
      toggleEcliptic()
    },
    {
      target: window
    }
  )

  const ecliptic = computed<Cartesian2DHorizontalCoordinate[]>(() => {
    const eclipticCoordinates: EquatorialCoordinate[] = getEclipticCoordinates(datetime.value)

    const width = dimensions.value.x

    const height = dimensions.value.y

    const long = longitude.value

    const lat = latitude.value

    // Loop over the ecliptic coordinates array:
    const ecliptic: Cartesian2DHorizontalCoordinate[] = eclipticCoordinates.map(
      (coordinate: EquatorialCoordinate) => {
        let { alt, az } = convertEquatorialToHorizontal(
          {
            ra: coordinate.ra,
            dec: coordinate.dec
          },
          {
            longitude: long,
            latitude: lat
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
          ...coordinate,
          alt: alt,
          az: az,
          x: x,
          y: y
        }
      }
    )

    return ecliptic
  })

  const drawEcliptic = (
    ctx: Ref<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>,
    fillStyle: string
  ): void => {
    if (ctx.value) {
      const precision = resolution.value

      ecliptic.value.forEach((coordinate: Cartesian2DHorizontalCoordinate) => {
        const { x, y } = coordinate

        if (x >= 0 && y >= 0 && ctx.value) {
          ctx.value.beginPath()
          ctx.value.arc(x, y, 1.25 * precision, 0, 2 * Math.PI, false)
          ctx.value.fillStyle = fillStyle
          ctx.value.fill()
          ctx.value.closePath()
        }
      })
    }
  }

  return {
    ecliptic,
    drawEcliptic,
    show: showEcliptic
  }
}

export type UseEclipticReturn = ReturnType<typeof useEcliptic>

export interface UseEclipticProps extends Partial<UseEclipticReturn> {}