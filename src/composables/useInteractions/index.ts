import { ref } from 'vue'

import { usePointer, useMousePressed } from '@vueuse/core'

import { useDrag } from '@vueuse/gesture'

export interface UseInteractionsOptions {
  /**
   * 
   * HTML Element to target for user interactions
   * 
   */
  element: HTMLElement | null
}

/**
 * 
 * reactive useInteractions()
 * 
 * @param options of type UseInteractionsOptions
 * @returns UseInteractionsReturn
 */
export const useInteractions = (options: UseInteractionsOptions) => {
  const { element } = options

  // Frame Dragging Boolean:
  const isDragging = ref(false)

  // Frame Tapping Boolean:
  const isTapping = ref(false)

  // Default Intersection Radius
  const intersectingRadius = ref(10)

  // Reactive Pointer or Mouse Positionining:
  const { x, y } = usePointer()

  //  Detect if the Mouse has been pressed:
  const { pressed } = useMousePressed({
    target: element,
    touch: true
  })

  useDrag(
    ({ tap, dragging }): void => {
      // Are we tapping the Sky Viewer frame?
      isTapping.value = tap
      // Are we dragging the Sky Viewer frame?
      isDragging.value = dragging
    },
    {
      domTarget: element,
      filterTaps: false,
      preventWindowScrollY: true
    }
  )

  return {
    isDragging,
    isTapping,
    intersectingRadius,
    x,
    y,
    pressed
  }
}

export type UseInteractionsReturn = ReturnType<typeof useInteractions>

export interface UseInteractionsProps extends Partial<UseInteractionsReturn> {}
