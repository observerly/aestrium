
import {
  computed,
  ref,
  ComputedRef,
  readonly,
  watch
} from 'vue'

import {
  onKeyStroke,
  useEventListener,
  useGeolocation,
  useRafFn,
  useUrlSearchParams
} from '@vueuse/core'

import type {
  HorizontalCoordinate
} from '@observerly/polaris'

// Ensuring any number meets validation for latitude:
export const validateLatitude = (latitude: number): boolean => {
  return (isFinite(latitude) && Math.abs(latitude) <= 90 && Math.abs(latitude) >= -90) || false
}

// Ensuring any number meets validation for longitude:
export const validateLongitude = (longitude: number): boolean => {
  return (isFinite(longitude) && Math.abs(longitude) <= 180 && Math.abs(longitude) >= -180) || false
}

export interface Observer {
  /**
   *
   * Longitude (in degrees)
   *
   */
  longitude: number
  /**
   *
   * Longitude (in degrees)
   *
   */
  latitude: number
  /**
   *
   * Elevation (in meteres above geoid)
   *
   */
  elevation: number
}

export interface UseObserverOptions extends Partial<Observer> {}

// defaultObserver at Infinity (outside the Universe!!)
const defaultObserver: Observer = {
  longitude: Infinity,
  latitude: Infinity,
  elevation: Infinity
}

/**
 *
 * reactive useObserver()
 *
 * @param options of type UseObserverOptions
 * @returns UseObserverReturn
 */
export const useObserver = (options?: UseObserverOptions) => {
  const {
    longitude: lon = defaultObserver.longitude,
    latitude: lat = defaultObserver.latitude,
    elevation: ele = defaultObserver.elevation
  } = options || {
    longitude: defaultObserver.longitude,
    latitude: defaultObserver.latitude,
    elevation: defaultObserver.elevation
  }

  // Obtain the querystring params of the url, if any:
  const params = useUrlSearchParams('history')

  // Reactive Geolocation API. It allows the user to provide their location
  // to web applications if they so desire. For privacy reasons, the user is
  // asked for permission to report location information.
  const { coords, locatedAt } = useGeolocation({
    enableHighAccuracy: false,
    maximumAge: 3600000,
    timeout: Infinity
  })

  const observer = ref({
    longitude: lon,
    latitude: lat,
    elevation: ele
  })

  const longitude: ComputedRef<number> = computed<number>(() => {
    // Hard-Set Reactive Props Has Preference:
    if (observer.value.longitude !== Infinity && validateLongitude(observer.value.longitude)) {
      return observer.value.longitude
    }

    // Params Override Have Second Preference:
    if (typeof params.longitude === 'string') {
      const longitude = parseFloat(params.longitude)

      if (validateLongitude(longitude)) {
        return longitude
      }
    }

    // DEFAULT observer longitude to the currently detected latitude or Mauna Kea Observatory:
    return locatedAt.value && locatedAt.value > 0 ? coords.value.latitude : -155.824615
  })

  const setLongitude = (longitude: number) => {
    observer.value.longitude = longitude
  }

  const latitude: ComputedRef<number> = computed<number>(() => {
    // Hard-Set Reactive Props Has Preference:
    if (observer.value.latitude !== Infinity && validateLongitude(observer.value.latitude)) {
      return observer.value.latitude
    }

    // Params Override Have Second Preference:
    if (typeof params.latitude === 'string') {
      const latitude = parseFloat(params.latitude)

      if (validateLatitude(latitude)) {
        return latitude
      }
    }

    // DEFAULT observer latitude to the currently detected latitude or Mauna Kea Observatory:
    return locatedAt.value && locatedAt.value > 0 ? coords.value.latitude : 20.005039
  })

  const setLatitude = (latitude: number) => {
    observer.value.latitude = latitude
  }

  const elevation = ref(ele)

  const setElevation = (elevation: number) => {
    observer.value.elevation = elevation
  }

  // Azimuthal offset for Observer's heading in α:
  const azOffset = ref(0)

  // Arrow right, move the observer heading eastwards ("right")
  onKeyStroke('ArrowRight', e => {
    e.preventDefault()
    azOffset.value += 0.5
  })

  // Arrow right, move the observer heading westwards ("left")
  onKeyStroke('ArrowLeft', e => {
    e.preventDefault()
    azOffset.value -= 0.5
  })

  // Altitudinal offset for Observer's heading in δ:
  const altOffset = ref(0)

  onKeyStroke('ArrowUp', e => {
    e.preventDefault()
    altOffset.value += 0.5
  })

  onKeyStroke('ArrowDown', e => {
    e.preventDefault()
    altOffset.value -= 0.5
  })

  const isSlewingToOffset = ref(false)

  const toggleIsSlewingToOffset = () => {
    isSlewingToOffset.value = !isSlewingToOffset.value
  }

  const horizontalObserverOffset = ref({
    az: 0,
    alt: 0
  })

  // Set the horizontal offset:
  const setHorizontalOffset = (offset: HorizontalCoordinate): void => {
    azOffset.value = offset.az
    altOffset.value = offset.alt
  }

  // Set the horizontal offset with a slew effect:
  const setHorizontalOffsetSlew = async (offset: HorizontalCoordinate): Promise<void> => {
    if (isSlewingToOffset.value) return
    toggleIsSlewingToOffset()
    horizontalObserverOffset.value = offset
    resume()
  }

  const { pause, resume } = useRafFn(() => {
    if (Math.round(azOffset.value) !== Math.round(horizontalObserverOffset.value.az)) {
      const azStep = Math.abs(azOffset.value - horizontalObserverOffset.value.az) / 20
      azOffset.value += (azStep * Math.sign(horizontalObserverOffset.value.az)) 
    }

    if (Math.round(altOffset.value) !== Math.round(horizontalObserverOffset.value.alt)) {
      const altStep = Math.abs(altOffset.value - horizontalObserverOffset.value.alt) / 20
      altOffset.value += (altStep * Math.sign(horizontalObserverOffset.value.alt)) 
    }
  })

  watch(azOffset, () => {
    // If the observer is slewing to an offset, return
    if (Math.round(azOffset.value) !== Math.round(horizontalObserverOffset.value.az)) {
      return
    }
    // Else, we can puase the request animation frame loop:
    pause()

    toggleIsSlewingToOffset()
  }, {
    immediate: true
  })

  watch(altOffset, () => {
    // If the observer is slewing to an offset, return
    if (Math.round(altOffset.value) !== Math.round(horizontalObserverOffset.value.alt)) {
      return
    }
    // Else, we can puase the request animation frame loop:
    pause()

    toggleIsSlewingToOffset()
  }, {
    immediate: true
  })

  const usingDeviceOrientation = ref(false)

  const toggleUsingDeviceOrientation = () => {
    usingDeviceOrientation.value = !usingDeviceOrientation.value
  }

  const deviceOrientationPermissionState = ref<string>('denied')

  // Has the user granted permission to use the device's native Web Orientation API (device.deviceorientation):
  const deviceOrientationPermissionGranted = computed(() => {
    return deviceOrientationPermissionState.value === 'granted'
  })

  const setDeviceOrientationPermission = async () => {
    /* eslint-disable-next-line no-console */
    console.info('Requesting User Permission for the DeviceOrientationEvent API')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deviceOrientationPermissionState.value = await DeviceOrientationEvent.requestPermission()

      usingDeviceOrientation.value = true
    }

    return false
  }

  useEventListener(window, 'deviceorientation', (e: DeviceOrientationEvent) => {
    if (e.alpha) {
      azOffset.value = e.alpha
    }

    if (e.webkitCompassHeading && usingDeviceOrientation.value) {
      azOffset.value = 360 - (180 - e.webkitCompassHeading)
    }
  })

  return {
    // Observer Geolocation Coordinates:
    observer: readonly(observer),
    longitude,
    latitude,
    elevation,
    setLongitude,
    setLatitude,
    // Observer Horizontal Offset:
    azOffset,
    altOffset,
    isSlewingToOffset,
    toggleIsSlewingToOffset,
    setHorizontalOffset,
    setHorizontalOffsetSlew,
    // Observer Orientation:
    usingDeviceOrientation,
    toggleUsingDeviceOrientation,
    deviceOrientationPermissionState,
    deviceOrientationPermissionGranted,
    setDeviceOrientationPermission
  }
}

export type UseObserverReturn = ReturnType<typeof useObserver>

export interface UseObserverProps extends Partial<UseObserverReturn> {}