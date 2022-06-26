
import {
  computed,
  ref,
  ComputedRef
} from 'vue'

import {
  onKeyStroke,
  useEventListener,
  useGeolocation,
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

  const longitude: ComputedRef<number> = computed<number>(() => {
    // Hard-Set Reactive Props Has Preference:
    if (lon !== Infinity && validateLongitude(lon)) {
      return lon
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

  const latitude: ComputedRef<number> = computed<number>(() => {
    // Hard-Set Reactive Props Has Preference:
    if (lat !== Infinity && validateLongitude(lat)) {
      return lat
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

  const elevation = ref(ele)

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

  // Set the horizontal offset:
  const setHorizontalOffset = (offset: HorizontalCoordinate): void => {
    azOffset.value = offset.az
    altOffset.value = offset.alt
  }

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
    longitude,
    latitude,
    elevation,
    // Observer Horizontal Offset:
    azOffset,
    altOffset,
    setHorizontalOffset,
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