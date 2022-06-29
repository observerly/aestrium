import { computed, ComputedRef, ref, Ref } from 'vue'

import { onKeyStroke } from '@vueuse/core'

import type { CartesianCoordinate, HorizontalCoordinate } from '@observerly/polaris'

import { convertHorizontalToStereo } from '@observerly/polaris'

export interface Cardinal {
  /**
   *
   * Observer's relative local azimuth.
   *
   */
  //
  az: number
  /**
   *
   * Canvas X Position
   *
   */
  x: number
  /**
   *
   * Canvas Y Position
   *
   */
  //
  y: number
  /**
   *
   * Represents the "heading" to display.
   *
   *
   */
  display: 'N' | 'E' | 'S' | 'W' | 'NE' | 'NW' | 'SE' | 'SW'
}

export interface UseCardinalsOptions {
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
   * are keyboard controls enabled?
   * 
   */
  controls?: boolean
}

/**
 *
 * reactive useCardinals()
 *
 * @param options of type UseCardinalsOptions
 * @returns
 */
export const useCardinals = (options: UseCardinalsOptions) => {
  const { azOffset, altOffset, dimensions, resolution, controls = true } = options

  const showCardinals = ref(true)

  const toggleCardinals = () => {
    showCardinals.value = !showCardinals.value
  }

  if (controls) {
    onKeyStroke(
      'd',
      (e: KeyboardEvent) => {
        e.preventDefault()
        toggleCardinals()
      },
      {
        target: window
      }
    )
  }

  const yOffset = computed(() => {
    return dimensions.value.y - 20
  })

  const getCardinal = (
    { az, alt }: HorizontalCoordinate,
    display: 'N' | 'E' | 'S' | 'W' | 'NE' | 'NW' | 'SE' | 'SW'
  ): Cardinal => {
    alt -= altOffset.value

    az -= azOffset.value

    const { x } = convertHorizontalToStereo(
      {
        alt: alt,
        az: az
      },
      dimensions.value.x,
      dimensions.value.y
    )

    return {
      az: az,
      x: x,
      y: yOffset.value,
      display: display
    }
  }

  const cardinals = computed(() => {
    let cardinals: Cardinal[] = []

    if (showCardinals.value) {
      const N: Cardinal = getCardinal({ az: 0, alt: 0 }, 'N')
      const E: Cardinal = getCardinal({ az: 90, alt: 0 }, 'E')
      const S: Cardinal = getCardinal({ az: 180, alt: 0 }, 'S')
      const W: Cardinal = getCardinal({ az: 270, alt: 0 }, 'W')

      cardinals = [N, E, S, W]
    }

    return cardinals
  })

  // Draw Cardinal Directions from their azimuthal definitions:
  const drawCardinals = (
    ctx: Ref<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>,
    fillStyle: string
  ): void => {
    if (ctx.value) {
      const fontSize = resolution.value * 12
      ctx.value.fillStyle = fillStyle
      ctx.value.font = `${fontSize}px "system-ui"`
      ctx.value.textAlign = 'center'
    }

    cardinals.value.forEach(cardinal => {
      ctx.value ? ctx.value.fillText(cardinal.display, cardinal.x, cardinal.y) : null
    })
  }

  return {
    cardinals,
    drawCardinals,
    show: showCardinals
  }
}

export type UseCardinalsReturn = ReturnType<typeof useCardinals>

export interface UseCardinalsProps extends Partial<UseCardinalsReturn> {}
