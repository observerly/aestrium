---
category: Reactives
---

# useObserver

Reactive observer that returns the most suitable geographic and astronomical position

## Usage

```ts
import { useObserver} from '@observerly/useaestrium

// This will either return the default Mauna Kea position or the "users"
// current geographic location (based off device permissions):
const { longitude, latitude } = useObserver({})
```

```ts
import { useObserver} from '@observerly/useaestrium

// Setup a specific observer:
const { longitude, latitude } = useObserver({
  longitude: -24.622997508,
  latitude: -70.40249839,
  elevation: 16000
})
```

We can specify a location which overrides all other defaults (params, detected location and default):

```ts
import { useObserver} from '@observerly/useaestrium

// Setup a specific observer:
const { longitude, latitude } = useObserver({
  longitude: -24.622997508,
  latitude: -70.40249839,
  elevation: 16000
})
```

See the [Type Declarations](#type-declarations) for more options.