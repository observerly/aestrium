<template>
  <div class="h-screen-adjust max-h-screen-adjust w-screen block relative overflow-hidden">
    <SkyViewer
      :clock="clock"
      :observer="observer"
      :options="options"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { SkyViewer } from '@/components'

import { useAdjustedScreen } from '@/composables'

import { useInternalClock, useObserver } from '@observerly/useaestrium'

// import { SkyViewerPosition } from '@/types'

const options = {
  live: true,
  showStars: true,
  showConstellations: true,
  showSun: true,
  showMoon: true,
  showEcliptic: true,
  showCardinalPoints: true,
  gradient: [
    {
      hex: '#4338CA',
      stop: 0
    },
    {
      hex: '#3730A3',
      stop: 1.0
    }
  ]
}

export default defineComponent({
  components: {
    SkyViewer
  },
  setup() {
    // const observer = useObserver({
    //   longitude: -24.622997508,
    //   latitude: -70.40249839,
    //   elevation: 16000
    // })

    const observer = useObserver({})

    // Setup the internal clock, returning the latest datetime:
    const clock = useInternalClock({
      isLive: true
    })

    useAdjustedScreen()

    return {
      clock,
      options,
      observer
    }
  }
})
</script>

<style>
.h-screen-adjust {
  /* Fallback for browsers that do not support Custom Properties */
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}

.max-h-screen-adjust {
  /* Fallback for browsers that do not support Custom Properties */
  max-height: 100vh;
  max-height: calc(var(--vh, 1vh) * 100);
}
</style>
