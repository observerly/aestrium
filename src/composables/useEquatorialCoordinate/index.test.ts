/**
 * @jest-environment jsdom
 */
import {
  describe,
  expect,
  it
} from 'vitest'

import {
  computed,
  defineComponent,
  nextTick,
  ref
} from 'vue'

import {
  useEquatorialCoordinate
} from '../'

describe('useEquatorialCoordinate', () => {
  it('Should Be Defined', () => {
    expect(useEquatorialCoordinate).toBeDefined()
  })

  it('Betelgeuse Should Be Where We Expect It To Be', () => {
    defineComponent({
      async setup() {
        // Define a star at a known Equatorial Coordinate:
        const betelgeuse = {
          ra: 88.7929583,
          dec: 7.4070639
        }

        //  For testing, we will fix the longitude and latitude to be Manua Kea, Hawaii, US
        const longitude = computed(() => {
          return -155.468094
        })

        const latitude = computed(() => {
          return 19.820611
        })

        // Obtain your canvas dimensions:
        const dimensions = computed(() => {
          return {
            x: 2660,
            y: 980
          }
        })

        // Obtain the screen resolution:
        const resolution = computed(() => {
          return 2
        })

        // For testing we need to specify a date because most calculations are
        // differential w.r.t a time component. We set it to the author's birthday:
        const datetime = ref(new Date('2021-05-14T00:00:00.000+00:00'))

        const { ra, dec, alt, az } = useEquatorialCoordinate({
          longitude: longitude,
          latitude: latitude,
          azOffset: ref(0),
          altOffset: ref(0),
          dimensions,
          resolution,
          datetime: datetime
        })

        ra.value = betelgeuse.ra
        dec.value = betelgeuse.dec

        await nextTick()

        expect(alt.value).toBeCloseTo(72.78539444063765, 1)
        expect(az.value).toBeCloseTo(134.44877920325155, 1)
      }
    })
  })
})