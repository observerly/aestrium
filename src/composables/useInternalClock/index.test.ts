/**
 * @jest-environment jsdom
 */
import {
  describe,
  expect,
  it
} from 'vitest'

import {
  useInternalClock
} from './'

import {
  useSetup
} from '../../utils'

describe('useInternalClock', () => {
  it('Should Be Defined', () => {
    expect(useInternalClock).toBeDefined()
  })

  it('Should Display The Current Datetime And Setup', () => {
    useSetup(async () => {
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
    })
  })

  it('Should Display The Current Datetime', () => {
    useSetup(async () => {
      // Setup the internal clock , returning the latest datetime:
      const {
        datetime,
        currentDatetime
      } = useInternalClock({
        datetime: new Date('2021-05-14T00:00:00.000+00:00'),
        isLive: false
      })

      expect(currentDatetime.value).toBe(datetime)
    })
  })
})