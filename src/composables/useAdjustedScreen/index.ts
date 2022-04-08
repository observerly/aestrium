import { useWindowSize } from '@vueuse/core'

import { onMounted, onUnmounted, watch } from 'vue'

/**
 *
 * reactive useAdjustedScreen()
 *
 */
export const useAdjustedScreen = (): void => {
  const { height } = useWindowSize()

  onMounted(async () => {
    // Get the viewport height and we multiple it by 1% to get a value for a vh unit:
    const vh = height.value * 0.01
    // Set the value in the --vh custom property to the root of the document:
    document.documentElement.style.setProperty('--vh', `${vh}px`)
    document.body.classList.add('overflow-hidden')
  })

  watch(height, () => {
    const vh = height.value * 0.01
    // Set the value in the --vh custom property to the root of the document:
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  })

  onUnmounted(() => {
    document.body.classList.remove('overflow-hidden')
  })
}
