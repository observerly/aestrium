import {
  onMounted,
  readonly,
  ref,
  watchEffect
} from 'vue'

import type {
  ComputedRef, Ref
} from 'vue'

import {
  convertEquatorialToHorizontal,
  convertHorizontalToStereo
} from '@observerly/polaris'

import type {
  CartesianCoordinate,
  EquatorialCoordinate
} from '@observerly/polaris'

export interface UseEquatorialCoordinateOptions {
  /**
   *
   * Longitude coordinate {in degrees}
   *
   */
  longitude: ComputedRef<number>
  /**
   *
   * Latitude coordinate {in degrees}
   *
   */
  latitude: ComputedRef<number>
  /**
   *
   * Azimuthal Offset
   *
   */
  azOffset: Ref<number>
  /**
   *
   * Altitudinal Offset
   *
   */
  altOffset: Ref<number>
  /**
   *
   * Dimenions (Width & Height) of the Projection Surface:
   *
   */
  dimensions: ComputedRef<CartesianCoordinate>
  /**
   *
   *
   * Screen Resolution
   *
   */
  resolution: ComputedRef<number>
  /**
   *
   * Datetime
   *
   */
  datetime: Ref<Date>
  /**
   *
   * Coordinate { ra, dec } of the observed celestial target:
   *
   */
  coordinate?: EquatorialCoordinate
}

const ra = ref(Infinity)

const dec = ref(Infinity)

const alt = ref(Infinity)

const az = ref(Infinity)

const x = ref(-1)

const y = ref(-1)

/**
 *
 * reactive useEquatorialCoordinate()
 *
 * @param options
 * @returns UseEquatorialCoordinateReturn { ra, dec, alt, az }
 */
export const useEquatorialCoordinate = (
  options: UseEquatorialCoordinateOptions
) => {
  const {
    longitude,
    latitude,
    azOffset,
    altOffset,
    // eslint-disable-next-line no-unused-vars
    resolution,
    dimensions,
    datetime,
    coordinate = {
      ra: Infinity,
      dec: Infinity
    }
  } = options

  onMounted(() => {
    if (coordinate && ra.value !== Infinity) {
      // eslint-disable-next-line no-unused-expressions
      ra.value === coordinate.ra
    }

    if (coordinate && dec.value !== Infinity) {
      // eslint-disable-next-line no-unused-expressions
      dec.value === coordinate.dec
    }
  })

  const setEquatorialCoordinate = (position: EquatorialCoordinate) => {
    ra.value = position.ra
    dec.value = position.dec
  }

  // Watch Effect for ra and dec:
  watchEffect(() => {
    const { alt: altitude, az: azimuth } = convertEquatorialToHorizontal(
      {
        ra: ra.value,
        dec: dec.value
      },
      {
        longitude: longitude.value,
        latitude: latitude.value
      },
      datetime.value
    )

    alt.value = altitude + altOffset.value
    az.value = azimuth + azOffset.value
  })

  // Watch Effect for alt and az:
  watchEffect(() => {
    const width = dimensions.value.x

    const height = dimensions.value.y

    const { x: X, y: Y } = convertHorizontalToStereo(
      {
        alt: alt.value,
        az: az.value
      },
      width,
      height
    )

    x.value = X
    y.value = Y
  })

  return {
    ra,
    dec,
    alt: readonly(alt),
    az: readonly(az),
    x: readonly(x),
    y: readonly(y),
    setEquatorialCoordinate
  }
}

export type UseEquatorialCoordinateReturn = ReturnType<typeof useEquatorialCoordinate>

export interface UseEquatorialCoordinateProps extends Partial<UseEquatorialCoordinateReturn> {}
