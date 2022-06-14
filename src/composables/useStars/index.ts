import { computed, onMounted, ComputedRef, Ref, ref } from 'vue'

import { onKeyStroke } from '@vueuse/core'

import type { Body, CartesianCoordinate, HorizontalCoordinate } from '@observerly/polaris'

import {
  convertHorizontalToStereo,
  convertEquatorialToHorizontal,
  normaliseStellarMagnitude
} from '@observerly/polaris'

import { drawBody, intersectDistance } from '@/utils'

const hasBayer = (star: Body): boolean => star.bayer.length > 0

const hasIAU = (star: Body): boolean => star.iau.length > 0

export interface UseStarsOptions {
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
  dimensions: ComputedRef<CartesianCoordinate>
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
}

export type StarObserved = Body &
  HorizontalCoordinate &
  CartesianCoordinate & {
    angularDiameter: number

    intersectDistance: number
  }

/**
 *
 * fetchMajorStars()
 *
 */
export const fetchMajorStars = async () => {
  try {
    const response = await fetch('https://vega.observerly.com/api/v1/stars/major')
    return await response.json()
  } catch (err) {
    console.error(err)
    return []
  }
}

/**
 *
 * fetchMinorStars()
 *
 */
export const fetchMinorStars = async () => {
  try {
    const response = await fetch('https://vega.observerly.com/api/v1/stars/minor')
    return await response.json()
  } catch (err) {
    console.error(err)
    return []
  }
}

/**
 *
 * reactive useMagnitude()
 *
 */
const useMagnitude = () => {
  // Magnitude Limit:
  const limit = ref(10)

  //  Magnitude Scaling:
  const scaling = 2.5

  // Increment/Decrement Magnitude Step:
  const step = 0.5

  // Increment the Stellar Magnitude:
  const incrementMagnitudeLimit = (): void => {
    if (limit.value < 6) {
      limit.value += step
    }
  }

  onKeyStroke(
    '=',
    (e: KeyboardEvent) => {
      e.preventDefault()
      incrementMagnitudeLimit()
    },
    {
      target: window
    }
  )

  // Decrement the Stellar Magnitude:
  const decrementMagnitudeLimit = (): void => {
    if (limit.value > 0) {
      limit.value -= step
    }
  }

  onKeyStroke(
    '-',
    (e: KeyboardEvent) => {
      e.preventDefault()
      decrementMagnitudeLimit()
    },
    {
      target: window
    }
  )

  return {
    limit,
    scaling
  }
}

export { useMagnitude as useStarsMagnitude }

/**
 * Reactive useStars()
 * Returns reactive stars, drawStars and showStars
 *
 * @param options of type UseStarOptions
 * @output
 */
export const useStars = (options: UseStarsOptions) => {
  const { longitude, latitude, azOffset, altOffset, dimensions, resolution, datetime, isDragging, x, y } =
    options

  const majorStars = ref([])

  const fetchMajorStars = async () => {
    const response = await fetch('https://observerly.com/api/v3/stars/major')
    majorStars.value = await response.json()
  }

  const minorStars = ref([])

  const fetchMinorStars = async () => {
    const response = await fetch('https://observerly.com/api/v3/stars/minor')
    minorStars.value = await response.json()
  }

  const peripheralStars = ref([])

  const fetchPeripheralStars = async () => {
    const response = await fetch('https://observerly.com/api/v3/stars/peripheral')
    peripheralStars.value = await response.json()
  }

  onMounted(() => {
    fetchMajorStars()
    fetchMinorStars()
    fetchPeripheralStars()
  })

  const { limit, scaling } = useMagnitude()

  const intersectingRadius = ref(30)

  const stars = computed<Body[]>(() => {
    return [...majorStars.value, ...minorStars.value, ...peripheralStars.value].filter(
      (s: Body) => parseFloat(s.apparentMagnitude) <= limit.value
    )
  })

  const _s = computed<StarObserved[]>(() => {
    const width = dimensions.value.x

    const height = dimensions.value.y

    const pixelRatio = resolution.value

    const s: StarObserved[] = stars.value.map((s: Body) => {
      // Get the star as a type Cartesian2DEquatorialCoordinate ({ ra, dec, x, y }):
      let { alt, az } = convertEquatorialToHorizontal(
        {
          ra: parseFloat(s.ra),
          dec: parseFloat(s.dec)
        },
        {
          longitude: longitude.value,
          latitude: latitude.value
        },
        datetime.value
      )

      alt -= altOffset.value

      az -= azOffset.value

      const star = convertHorizontalToStereo(
        {
          alt: alt,
          az: az
        },
        width,
        height
      )

      return {
        ...s,
        alt,
        az,
        x: star.x,
        y: star.y,
        angularDiameter: normaliseStellarMagnitude(parseInt(s.apparentMagnitude), 4.5) * scaling * 0.325,
        intersectDistance: intersectDistance(
          {
            x: x.value * pixelRatio,
            y: y.value * pixelRatio
          },
          {
            x: star.x,
            y: star.y
          }
        )
      }
    })

    return s.filter(
      // Filter only the stars inside the bounding box:
      (s: StarObserved) => s.x >= 0 && s.x <= width && s.y >= 0 && s.y <= height
    )
  })

  const star = computed<StarObserved | undefined>(() => {
    return !isDragging.value
      ? _s.value
          .filter((s: StarObserved) => s.intersectDistance <= intersectingRadius.value)
          .sort((i, j) => parseInt(i.apparentMagnitude) + parseInt(j.apparentMagnitude))[0]
      : undefined
  })

  const drawStars = (ctx: Ref<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>): void => {
    if (ctx.value) {
      const precision = resolution.value

      _s.value.forEach((s: StarObserved) => {
        drawBody(ctx.value, s.x, s.y, s.angularDiameter, '#FFFFFF', precision)
      })

      // Close off the current context's path:
      ctx.value.closePath()
    }
  }

  return {
    star,
    stars: _s,
    drawStars
  }
}

export type UseStarsReturn = ReturnType<typeof useStars>

export interface UseStarsProps extends Partial<UseStarsReturn> {}
