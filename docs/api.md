# Declarity API


## Entity

The abstract class which Entities extend from.

i.e:
```
import {Entity} from 'declarity'

class MyEntity extends Entity {
  ...
}
```

### Entity methods

#### General methods:

`getChildContext` -> function that returns an object which will be added to the context that is passed to child entities.

#### When mounting:

`willMount({props, children})`

`create({props, children})`
- returns state for the entity.

`didCreate({props, state, children, setState})`
- since `create()` can be async, this method is needed.

`render({props, state, children})`


`didMount`

When updating:

`willUpdate({previousProps, previousChildren, previousState, props, children, state})`

`update()`

`didUpdate({previousProps, previousChildren, previousState, props, children, state})`

`render()`


When being destructed:

`willUnmount({props, children, state})`



## register

user to register an Entity class

i.e:

```
import {register} from 'declarity'
import App from 'App'

register(<App />)
```

## Params

methods: getParams, setState
