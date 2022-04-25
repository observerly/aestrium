<template>
  <div
    ref="root"
    class="h-full w-full bg-gray-800 overflow-hidden select-none z-10 relative"
  >
    <!-- Start Sky Viewer Canvas -->
    <canvas
      v-show="dimensions.x && dimensions.y && isReady"
      ref="canvas"
      aria-label="All-Sky Star Observatory"
      role="presentation"
      unselectable="on"
      tabindex="0"
      draggable="false"
      class="h-full w-full absolute z-20 top-0 left-o right-0 bottom-0 overflow-hidden select-none"
      :class="{
        'cursor-move': !isDragging,
        'cursor-grabbing': isDragging
      }"
    />
    <!-- End Sky Viewer Canvas -->
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, toRef, watch } from 'vue'

import { useIntervalFn } from '@vueuse/core'

import { SkyViewerOptions, SkyViewerPosition } from '@/types'

import type { UseInternalClockReturn, UseObserverReturn } from '@observerly/useaestrium'

import { useEquatorialCoordinate } from '@observerly/useaestrium'

import {
  useCardinals,
  useConstellations,
  useCanvas,
  useEcliptic,
  useMoon,
  useStars,
  useSun,
  useInteractions
} from '@/composables'

export default defineComponent({
  name: 'SkyViewer',
  props: {
    clock: {
      type: Object as PropType<UseInternalClockReturn>,
      required: true
    },
    observer: {
      type: Object as PropType<UseObserverReturn>,
      required: true
    },
    options: {
      type: Object as PropType<SkyViewerOptions>,
      required: true
    }
  },
  emits: {
    'on:active-position-change': (v: SkyViewerPosition, i: { isDragging: boolean }): boolean => {
      return (
        !isNaN(v.top) &&
        !isNaN(v.right) &&
        !isNaN(v.bottom) &&
        !isNaN(v.left) &&
        (i.isDragging || !i.isDragging)
      )
    }
  },
  setup(props, { emit }) {
    const clock = toRef(props, 'clock')

    const observer = toRef(props, 'observer')

    const { canvas, ctx, root, dimensions, resolution } = useCanvas()

    // Obtain the User Sky Viewer Interactions:
    const { isDragging, isTapping, x, y, pressed } = useInteractions({
      element: root.value
    })

    // watch the change the x position and ensure we are dragging:
    watch(x, (prevX, newX) => {
      isDragging.value = pressed.value

      if (
        pressed.value &&
        isDragging.value &&
        !isTapping.value &&
        !props.observer.usingDeviceOrientation?.value
      ) {
        if (prevX - newX < dimensions.value.x / 3 && prevX - newX > -dimensions.value.x / 3) {
          const az = (props.observer.azOffset.value + (newX - prevX) / 6) % 360

          props.observer.setHorizontalOffset({
            alt: 0,
            az: az
          })
        }
      }
    })

    // Setup the Stars:
    const { star, drawStars } = useStars({
      longitude: observer.value.longitude,
      latitude: observer.value.latitude,
      azOffset: observer.value.azOffset,
      altOffset: observer.value.altOffset,
      dimensions,
      resolution,
      datetime: clock.value.currentDatetime,
      isDragging,
      x,
      y
    })

    // Setup the Constellations:
    const { drawConstellations, show: showConstellations } = useConstellations({
      longitude: observer.value.longitude,
      latitude: observer.value.latitude,
      azOffset: observer.value.azOffset,
      altOffset: observer.value.altOffset,
      dimensions,
      resolution,
      datetime: clock.value.currentDatetime,
      isDragging,
      x,
      y,
      show: props.options.showConstellations ? props.options.showConstellations : false
    })

    // Setup the Sun:
    const { drawSun, show: showSun } = useSun({
      longitude: observer.value.longitude,
      latitude: observer.value.latitude,
      azOffset: observer.value.azOffset,
      altOffset: observer.value.altOffset,
      dimensions,
      resolution,
      datetime: clock.value.currentDatetime,
      isDragging,
      x,
      y,
      show: props.options.showSun ? props.options.showSun : true
    })

    // Setup the Moon:
    const { drawMoon, show: showMoon } = useMoon({
      longitude: observer.value.longitude,
      latitude: observer.value.latitude,
      azOffset: observer.value.azOffset,
      altOffset: observer.value.altOffset,
      dimensions,
      resolution,
      datetime: clock.value.currentDatetime,
      isDragging,
      x,
      y,
      show: props.options.showMoon ? props.options.showMoon : true
    })

    // Setup the Ecliptic:
    const { drawEcliptic, show: showEcliptic } = useEcliptic({
      longitude: observer.value.longitude,
      latitude: observer.value.latitude,
      azOffset: observer.value.azOffset,
      altOffset: observer.value.altOffset,
      dimensions,
      resolution,
      datetime: clock.value.currentDatetime,
      show: props.options.showEcliptic ? props.options.showEcliptic : false
    })

    // Setup the Cardinals:
    const { drawCardinals, show: showCardinals } = useCardinals({
      azOffset: observer.value.azOffset,
      altOffset: observer.value.altOffset,
      dimensions,
      resolution
    })

    const {
      x: X,
      y: Y,
      setEquatorialCoordinate
    } = useEquatorialCoordinate({
      longitude: observer.value.longitude,
      latitude: observer.value.latitude,
      azOffset: observer.value.azOffset,
      altOffset: observer.value.altOffset,
      dimensions,
      resolution,
      datetime: clock.value.currentDatetime
    })

    watch(pressed, () => {
      if (pressed.value && star.value) {
        setEquatorialCoordinate({
          ra: parseInt(star.value.ra),
          dec: parseInt(star.value.dec)
        })
      }

      if (pressed.value && !star.value) {
        setEquatorialCoordinate({
          ra: Infinity,
          dec: Infinity
        })
      }
    })

    watch([X, Y], () => {
      const width = dimensions.value.x - 100

      const height = dimensions.value.y - 100

      const isReadytoEmit = !!(
        X.value &&
        X.value >= 100 &&
        X.value <= width &&
        Y.value &&
        Y.value >= 100 &&
        Y.value <= height
      )

      const precision = resolution.value - 9

      emit(
        'on:active-position-change',
        {
          bottom: 0,
          left: isReadytoEmit ? X.value / precision : -9999,
          right: 0,
          top: isReadytoEmit ? Y.value / precision : -9999
        },
        {
          isDragging: isDragging.value
        }
      )
    })

    onMounted(() => {
      useIntervalFn(() => {
        if (ctx.value) {
          const gd = ctx.value.createLinearGradient(0, 0, 0, dimensions.value.y)
          // Apply the dynamic gradient color stops with props.options.gradient:
          props.options.gradient.forEach(gradient => gd.addColorStop(gradient.stop, gradient.hex))

          ctx.value.fillStyle = gd
          ctx.value.fillRect(
            0,
            0,
            dimensions.value.x * resolution.value,
            dimensions.value.y * resolution.value
          )

          drawStars(ctx)

          if (showConstellations.value) {
            drawConstellations(ctx, '#FFFFFF')
          }

          if (showEcliptic.value) {
            drawEcliptic(ctx, '#818CF880')
          }

          if (showSun.value) {
            drawSun(ctx, 5, '#FFFFFF', '#FFFFFF')
          }

          if (showMoon.value) {
            drawMoon(ctx)
          }

          if (showCardinals.value) {
            drawCardinals(ctx, '#FFFFFF')
          }
        }
      }, props.clock.delay.value)
    })

    const isReady = computed(() => {
      // return stars.value.length > 0
      return true
    })

    return {
      // HTML Element Template References:
      root,
      canvas,
      // Screen Dimensions
      dimensions,
      // Dragging / Tapping Functionality
      isDragging,
      isTapping,
      // Toggles / Booleans
      isReady
    }
  }
})
</script>
