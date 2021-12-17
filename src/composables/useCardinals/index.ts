import { computed, ref } from 'vue'

import type {
  ComputedRef
} from 'vue'

import { onKeyStroke } from '@vueuse/core'

import {
  stereoProjectHorizontalToCartesian2DCoordinate
} from '@observerly/celestia'

import type {
  GeographicPointCoordinate,
  HorizontalCoordinate
} from '@observerly/celestia'

import type {
  SkyViewerCanvas,
  SkyViewerObserverOffset,
  SkyViewerCanvasRenderingContext2D
} from '@/types'

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
   * computed canvas object representing the width and height dimensions of the canvas:
   * 
   */
  canvas: ComputedRef<SkyViewerCanvas>
  /**
   * 
   * observer object representing a longitude and latitude position, as well as an observed offset:
   * 
   */
  observer: GeographicPointCoordinate & SkyViewerObserverOffset
  /**
   * 
   * A boolean flag for if cardinals are shown:
   * 
   */
  show: boolean
}

/**
 * 
 * reactive useCardinals()
 * 
 * @param options of type UseCardinalsOptions
 * @returns 
 */
export const useCardinals = (
  options: UseCardinalsOptions
) => {
  const { canvas, observer, show } = options

  const showCardinals = ref(show)

  const toggleCardinals = () => {
    showCardinals.value = !showCardinals.value
  }

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

  const yOffset = computed(() => {
    return canvas.value.height - 20
  })

  const getCardinal = (
    { az, alt }: HorizontalCoordinate,
    display: 'N' | 'E' | 'S' | 'W' | 'NE' | 'NW' | 'SE' | 'SW'
  ): Cardinal => {
    alt -= observer.altitudinalOffset.value

    az -= observer.azimuthalOffset.value

    const { x } = stereoProjectHorizontalToCartesian2DCoordinate(
      {
        alt: alt,
        az: az
      },
      canvas.value.width,
      canvas.value.height
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

  // Draw Cardinal Directions (N,E,S,W) from their azimuthal definitions:
  const drawCardinals = (
    ctx: SkyViewerCanvasRenderingContext2D,
    fillStyle: string,
    scaling: number
  ): SkyViewerCanvasRenderingContext2D => {
    const fontSize = scaling * 12

    ctx.fillStyle = fillStyle
    ctx.font = `${fontSize}px "system-ui"`
    ctx.textAlign = 'center'

    cardinals.value.forEach(cardinal => {
      ctx.fillText(cardinal.display, cardinal.x, cardinal.y)
    })

    return ctx
  }

  return {
    cardinals,
    drawCardinals,
    show: showCardinals
  }
}

export type UseCardinalsReturn = ReturnType<typeof useCardinals>

export interface UseCardinalsProps extends Partial<UseCardinalsReturn> {}