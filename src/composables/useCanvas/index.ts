import { onMounted, ref } from 'vue'

import { throttledWatch } from '@vueuse/core'

import { useDimensions } from '@/composables'

export const useCanvas = () => {
  // This is the canvas HTMLCanvasElement element as a ref:
  const canvas = ref<HTMLCanvasElement | null>(null)

  // This is the (pseudo) offscreen canvas HTMLCanvasElement | OffscreenCanvas as a ref:
  const canvasOptimised = ref<HTMLCanvasElement | OffscreenCanvas | null>(null)

  // Setup the dimensions:
  const { root, dimensions, resolution } = useDimensions()

  const ctx = ref<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>(null)

  onMounted(() => {
    // Obtain a pseudo offscreen canvas, from either canvas.value.transferControlToOffscreen() or if
    // unsupported the default canavs. This could be either type of Ref<HTMLCanvasElement | OffscreenCanvas >
    canvasOptimised.value =
      'OffscreenCanvas' in window && canvas.value ? canvas.value.transferControlToOffscreen() : canvas.value

    if (canvasOptimised.value) {
      // Canvas is expected to have a style.width and style.height property:
      canvasOptimised.value.width = dimensions.value.x
      canvasOptimised.value.height = dimensions.value.y

      ctx.value = canvasOptimised.value ? canvasOptimised.value.getContext('2d', { alpha: false }) : null
    }
  })

  throttledWatch(
    dimensions,
    () => {
      // Canvas is expected to have a style.width and style.height property:
      if (canvasOptimised.value) {
        canvasOptimised.value.width = dimensions.value.x
        canvasOptimised.value.height = dimensions.value.y
      }
    },
    { throttle: 800 }
  )

  return {
    // HTML Canvas Element:
    canvas,
    // Optimised HTML Canvas Element | Offscreen Element:
    canvasOptimised,
    // HTML Canvas 2D Rendering Context:
    ctx,
    // Parent to HTML Canvas Element:
    root,
    dimensions,
    resolution
  }
}

export type UseCanvasReturn = ReturnType<typeof useCanvas>

export interface UseCanvasProps extends Partial<UseCanvasReturn> {}