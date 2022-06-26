/**
 * @jest-environment jsdom
 */
 import {
  describe,
  expect,
  it
} from 'vitest'

import {
  defineComponent
} from 'vue'

import {
  useInternalClock
} from '../'
 
describe('useInternalClock', () => {
  it('Should Be Defined', () => {
    expect(useInternalClock).toBeDefined()
  })

  it('Should Display The Current Datetime And Setup', () => {
    // eslint-disable-next-line vue/one-component-per-file
    defineComponent({
      setup() {
        // Setup the internal clock , returning the latest datetime:
        const {
          datetime,
          currentDatetime,
          setupInternalClock
        } = useInternalClock({
        })

        expect(currentDatetime.value).toBe(datetime)

        setupInternalClock()

        expect(currentDatetime.value).not.toBe(datetime)
      }
    })
  })

  it('Should Display The Current Datetime', () => {
    // eslint-disable-next-line vue/one-component-per-file
    defineComponent({
      setup() {
        const {
          datetime,
          currentDatetime
        } = useInternalClock({
          datetime: new Date('2021-05-14T00:00:00.000+00:00'),
          isLive: false
        })
  
        expect(currentDatetime.value).toBe(datetime)
      }
    })
  })
})