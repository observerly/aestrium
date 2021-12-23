import { computed, onMounted, ComputedRef, Ref, ref } from 'vue'

import { onKeyStroke } from '@vueuse/core'

import {
  convertEquatorialToHorizontal,
  convertMagnitudeToIAUScalar,
  stereoProjectHorizontalToCartesian2DCoordinate,
  Cartesian2DCoordinate,
  Star,
  StarObservedRelative
} from '@observerly/celestia'

import { drawBody, intersectDistance } from '@/utils'

const hasBayer = (star: Star): boolean => star.bayerDesignation.length > 0

const hasIAU = (star: Star): boolean => star.iauName.length > 0

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
}

export interface StarObservedRelativeExtended extends StarObservedRelative {
  angularDiameter: number
}

/**
 * 
 * fetchMajorStars()
 * 
 */
export const fetchMajorStars = async () => {
  try {
    const response = await fetch('http://192.168.178.26:8083/api/v1/stars/major')
    return await response.json()
  } catch {
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
    const response = await fetch('http://192.168.178.26:8083/api/v1/stars/minor')
    return await response.json()
  } catch {
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

export { useMagnitude  as useStarsMagnitude }

/**
 * Reactive useStars()
 * Returns reactive stars, drawStars and showStars
 *
 * @param options of type UseStarOptions
 * @output
 */
export const useStars = (options: UseStarsOptions) => {
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
    y
  } = options

  const stars = ref<Star[]>([])

  const majorStars = ref([])

  const minorStars = ref([])

  const { limit, scaling } = useMagnitude()

  onMounted(async () => {
    majorStars.value = await fetchMajorStars()
    minorStars.value = await fetchMinorStars()
    stars.value = [...majorStars.value, ...minorStars.value].filter(
      (s: Star) =>
        parseFloat(s.apparentMagnitude) <= limit.value && (hasBayer(s) || hasIAU(s))
    )
  })

  const intersectingRadius = ref(30)

  const _s = computed<StarObservedRelativeExtended[]>(() => {
    const width = dimensions.value.x

    const height = dimensions.value.y

    const pixelRatio = resolution.value

    return stars.value
      .map((s: Star) => {
        // Get the star as a type Cartesian2DEquatorialCoordinate ({ ra, dec, x, y }):
        let { alt, az } = convertEquatorialToHorizontal(
          {
            ra: parseFloat(s.ra),
            dec: parseFloat(s.dec)
          },
          {
            longitude: longitude.value,
            latitude: latitude.value,
          },
          datetime.value
        )

        alt -= altOffset.value

        az -= azOffset.value

        const star = stereoProjectHorizontalToCartesian2DCoordinate(
          {
            alt: alt,
            az: az
          },
          width,
          height
        )

        return {
          ...s,
          x: star.x,
          y: star.y,
          angularDiameter:
            convertMagnitudeToIAUScalar(parseInt(s.apparentMagnitude), 3.5) * scaling * 0.35,
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
      .filter(
        // Filter only the stars inside the bounding box:
        (s: StarObservedRelativeExtended) =>
          s.x >= 0 && s.x <= width && s.y >= 0 && s.y <= height
      )
  })

  const star = computed<StarObservedRelativeExtended | undefined>(() => {
    return !isDragging.value
      ? _s.value
          .filter((s: StarObservedRelativeExtended) => s.intersectDistance <= intersectingRadius.value)
          .sort((i, j) => parseInt(i.apparentMagnitude) + parseInt(j.apparentMagnitude))[0]
      : undefined
  })

  const drawStars = (ctx: Ref<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>): void => {
    if (ctx.value) {
      const precision = resolution.value

      _s.value.forEach((s: StarObservedRelativeExtended) => {
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