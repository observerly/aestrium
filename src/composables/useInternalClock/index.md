---
category: Reactives
---

# useInternalClock

Reactive internal clock that runs on an interval

## Usage

```ts
import { useInternalClock } from '@observerly/useaestrium

// Setup the internal clock , returning the latest datetime:
const {
  datetime, 
  defaultDelay 
} = useInternalClock({})

// Setup the internal clock returning the latest datetime:
const { datetime, defaultDelay } = useInternalClock({})

// Or, setup the clock to be a snapshot in time:
const { datetime, defaultDelay } = useInternalClock({
  datetime: new Date('2021-05-14T00:00:00.000+00:00'),
  isLive: false
})

// Setup the internal clock, at a specific datetime, returning the latest datetime:
const { datetime, defaultDelay } = useInternalClock({
  datetime: new Date('2021-05-14T00:00:00.000+00:00'),
  isLive: true
})
```

See the [Type Declarations](#type-declarations) for more options.