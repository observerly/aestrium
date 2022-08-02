<template>
  <div class="h-screen-adjust max-h-screen-adjust w-screen block relative">
    <div class="h-full w-full absolute inset-0 z-50">
      <div class="h-full w-full flex items-center justify-center">
        <ObserverlyLogo
          class="h-10 w-auto text-white"
        />
      </div>
    </div>
    
    <div
      class="
      w-full
      h-full
      absolute
      inset-0
      backdrop-filter
      backdrop-blur-0
      bg-gray-800
      bg-opacity-60"
    />
    <SkyViewer
      :clock="clock"
      :observer="observer"
      :options="options"
      @on:active-position-change="onActivePositionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ObserverlyLogo, SkyViewer } from '@/components'

import { useInternalClock, useObserver, useAdjustedScreen } from '@/composables'

import type { SkyViewerPosition } from '@/types'

const options = {
  live: true,
  enabled: true,
  controls: true,
  interactions: true,
  showStars: true,
  showConstellations: false,
  showSun: false,
  showMoon: false,
  showEcliptic: false,
  showCardinalPoints: true,
  gradient: [
    {
      hex: '#394151',
      stop: 0
    }
  ]
}

const observer = useObserver({
  longitude: 19.2327933455,
  latitude: -20.295115731,
  elevation: 1600
})

// Setup the internal clock, returning the latest datetime:
const clock = useInternalClock({
  isLive: true
})

const onActivePositionChange = (v: SkyViewerPosition, i: { isDragging: boolean }) => {
  return i.isDragging && v.top
}

useAdjustedScreen()
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
