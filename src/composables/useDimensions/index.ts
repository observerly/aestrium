import { computed, onMounted, ref, watch } from 'vue'

import { useDevicePixelRatio, useResizeObserver, useWindowSize } from '@vueuse/core'

import { Cartesian2DCoordinate } from '@observerly/celestia'

// Obtain the Device Pixel Ratio:
const { pixelRatio } = useDevicePixelRatio()

/**
 * 
 * reactive useDimensions()
 * 
 */
export const useDimensions = () => {
  // This is the HTMLElement root element as a ref:
  const root = ref<HTMLElement | null>(null)

  const x = ref(0)

  const y = ref(0)

  const { width: screenWidth, height: screenHeight } = useWindowSize()

  onMounted(() => {
    x.value = screenWidth.value
    y.value = screenHeight.value
  })

  watch(screenWidth, () => {
    x.value = screenWidth.value
  })

  watch(screenHeight, () => {
    y.value = screenHeight.value
  })

  const dimensions = computed<Cartesian2DCoordinate>(() => {
    return {
      x: x.value * resolution.value,
      y: y.value * resolution.value
    }
  })

  const resolution = computed(() => {
    return pixelRatio.value
  })

  useResizeObserver(root, entries => {
    const entry = entries[0]
    const { width, height } = entry.contentRect
    x.value = width
    y.value = height
  })

  return {
    root,
    dimensions,
    resolution
  }
}

export type UseDimensionsReturn = ReturnType<typeof useDimensions>

export interface UseDimensionsProps extends Partial<UseDimensionsReturn> {}
