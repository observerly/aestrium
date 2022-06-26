import {
  ref, onMounted
} from 'vue'

import type {
  Ref
} from 'vue'

import {
  onKeyStroke, useIntervalFn
} from '@vueuse/core'

export interface UseInternalClockOptions {
  /**
   *
   * clock starting datetime:
   *
   */
  datetime?: Date
  /**
   *
   * reactive isLive boolean (set's the clock running if true)
   *
   */
  isLive?: boolean
}

/**
 *
 * reactive internal clock useInternalClock()
 *
 * @param options of type UseInternalClockOptions
 * @returns UseInternalClockReturn
 */
export const useInternalClock = (options?: UseInternalClockOptions) => {
  const {
    datetime = new Date(),
    isLive = true
  } = options || {
    datetime: new Date(),
    isLive: true
  }

  // This is the delay to the time increments, in milliseconds:
  const defaultDelay = 30

  const delay = ref(defaultDelay)

  // Seek can apply to backward or forward time "travel", and in this case interval is the duration skipped by each seek step:
  const isSeekingInterval = ref(false)

  const setupInternalClock = (): void => {
    // Increment the datetime by the "interval" fast-forward:
    if (!isSeekingInterval.value) {
      currentDatetime.value = new Date(new Date().getTime() + delay.value)
    } else {
      currentDatetime.value = new Date(currentDatetime.value.getTime() + delay.value)
    }
  }

  const currentDatetime: Ref<Date> = ref<Date>(datetime)

  const setDatetime = (date: Date): void => {
    currentDatetime.value = date
  }

  // Increment the delay factor:
  const incrementDelay = (): void => {
    isSeekingInterval.value = true

    if (delay.value === 0) {
      // delay scaling with 100 milliseconds:
      delay.value = defaultDelay
    }

    if (delay.value < 100000000000000) {
      delay.value *= 10
    }
  }

  // Decrement the delay factor:
  const decrementDelay = (): void => {
    isSeekingInterval.value = true

    if (delay.value === 0) {
      // delay scaling with 100 milliseconds:
      delay.value = defaultDelay
    }

    if (delay.value > defaultDelay) {
      delay.value /= 10
    }
  }

  const freezeDelay = (): void => {
    delay.value = defaultDelay
  }

  const resetDelay = (): void => {
    isSeekingInterval.value = true
    delay.value = defaultDelay
    currentDatetime.value = new Date()
  }

  // When user clicks the > (.) button, we speed up the delay:
  onKeyStroke(
    '.',
    (e: KeyboardEvent) => {
      e.preventDefault()
      incrementDelay()
    },
    {
      target: window
    }
  )

  // When user clicks the < (,) button, we slow down the delay:
  onKeyStroke(
    ',',
    (e: KeyboardEvent) => {
      e.preventDefault()
      decrementDelay()
    },
    {
      target: window
    }
  )

  // When the user clicks the ? (/) button, we stop at the current time:
  onKeyStroke(
    '/',
    (e: KeyboardEvent) => {
      e.preventDefault()
      freezeDelay()
    },
    {
      target: window
    }
  )

  // When the user clicks the ? (/) button, we reset the datetime back to current time:
  onKeyStroke(
    '`',
    (e: KeyboardEvent) => {
      e.preventDefault()
      resetDelay()
    },
    {
      target: window
    }
  )

  onMounted(() => {
    if (isLive) {
      useIntervalFn(setupInternalClock, defaultDelay)
    }
  })

  return {
    datetime,
    currentDatetime,
    setDatetime,
    delay,
    defaultDelay,
    incrementDelay,
    decrementDelay,
    setupInternalClock
  }
}

export type UseInternalClockReturn = ReturnType<typeof useInternalClock>

export interface UseInternalClockProps extends Partial<UseInternalClockReturn> {}