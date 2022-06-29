import { ref, watch, ComputedRef, Ref } from 'vue'

import type { CartesianCoordinate, HorizontalCoordinate } from '@observerly/polaris'

import {
  constellations,
  convertEquatorialToHorizontal,
  convertHorizontalToEquatorial,
  convertHorizontalToStereo,
  convertStereoToHorizontal,
  getConstellation
} from '@observerly/polaris'

import { drawLine } from '@/utils'

import { onKeyStroke } from '@vueuse/core'

export interface UseConstellationOptions {
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
  /**
   *
   * show constellations boolean
   *
   */
  show: boolean
  /**
   * 
   * are keyboard controls enabled?
   * 
   */
   controls?: boolean
}

/**
 * Reactive useConstellations()
 * Returns reactive constellations, drawConstellations and showConstellations
 *
 * @param options of type UseConstellationsOptions
 * @output
 */
export const useConstellations = (options: UseConstellationOptions) => {
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
    show,
    controls = true
  } = options

  // Show all constellations:
  const showConstellations = ref<boolean>(show)

  // Toggle constellations visibility:
  const toggleConstellations = () => {
    showConstellations.value = !showConstellations.value
  }

  if (controls) {
    // on key stroke listener for key 'c' to toggle constellations on/off:
    onKeyStroke(
      'c',
      (e: KeyboardEvent) => {
        e.preventDefault()
        toggleConstellations()
      },
      {
        target: window
      }
    )
  }
  

  // Active { x, y } Mouse Position Intersecting Constellation:
  const constellation = ref('')

  watch([x, y] as const, () => {
    const width = dimensions.value.x

    const height = dimensions.value.y

    const pixelRatio = resolution.value

    if (showConstellations.value && !isDragging.value) {
      let { alt, az } = convertStereoToHorizontal(
        {
          x: x.value * pixelRatio,
          y: y.value * pixelRatio
        },
        width,
        height
      )

      alt += altOffset.value

      az += azOffset.value

      const { ra, dec } = convertHorizontalToEquatorial(
        {
          alt: alt,
          az: az
        },
        {
          longitude: longitude.value,
          latitude: latitude.value
        },
        datetime.value
      )

      const currentConstellation = getConstellation(
        {
          ra: ra,
          dec: dec
        },
        datetime.value
      )

      if (currentConstellation) {
        constellation.value = currentConstellation.name
      }
    }
  })

  const furthestXDrawingPoint = ref<number>(0.2 * dimensions.value.x)

  const furthestYDrawingPoint = ref<number>(0.2 * dimensions.value.y)

  // Draw Constellations to the Canvas
  const drawConstellations = (
    ctx: Ref<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>,
    strokeStyle: string
  ): void => {
    const width = dimensions.value.x

    const height = dimensions.value.y

    const constellationInFocus = constellation.value

    // Save the current context:
    constellations.forEach(constellation => {
      if (ctx.value) {
        if (constellationInFocus === constellation.name) {
          ctx.value.strokeStyle = `${strokeStyle}65`
          ctx.value.lineWidth = 3
          ctx.value.setLineDash([])
        } else {
          ctx.value.strokeStyle = `${strokeStyle}45`
          ctx.value.lineWidth = 1
          ctx.value.setLineDash([2, 5])
        }
      }

      // For brevity, an aster is the line joining two points in a constellation:
      constellation.aster.forEach(aster => {
        const moveTo: HorizontalCoordinate = convertEquatorialToHorizontal(
          {
            ra: aster.moveTo.ra,
            dec: aster.moveTo.dec
          },
          {
            longitude: longitude.value,
            latitude: latitude.value
          },
          datetime.value
        )

        const lineTo: HorizontalCoordinate = convertEquatorialToHorizontal(
          {
            ra: aster.lineTo.ra,
            dec: aster.lineTo.dec
          },
          {
            longitude: longitude.value,
            latitude: latitude.value
          },
          datetime.value
        )

        moveTo.alt -= altOffset.value

        moveTo.az -= azOffset.value

        lineTo.alt -= altOffset.value

        lineTo.az -= azOffset.value

        const moveTo2DCartiesian: CartesianCoordinate = convertHorizontalToStereo(
          {
            alt: moveTo.alt,
            az: moveTo.az
          },
          width,
          height
        )

        const lineTo2DCartiesian: CartesianCoordinate = convertHorizontalToStereo(
          {
            alt: lineTo.alt,
            az: lineTo.az
          },
          width,
          height
        )

        if (
          moveTo2DCartiesian.x > -furthestXDrawingPoint.value &&
          moveTo2DCartiesian.y > -furthestYDrawingPoint.value
        ) {
          drawLine(ctx.value, moveTo2DCartiesian, lineTo2DCartiesian)
        }

        // Close off the current context's path:
        if (ctx.value) ctx.value.closePath()
      })
    })

    // Restore the current context:
    if (ctx.value) ctx.value.setLineDash([])
  }

  return {
    constellation,
    constellations,
    drawConstellations,
    toggleConstellations,
    show: showConstellations
  }
}

export type UseConstellationsReturn = ReturnType<typeof useConstellations>

export interface UseConstellationsProps extends Partial<UseConstellationsReturn> {}
