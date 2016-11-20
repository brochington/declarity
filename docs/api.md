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

When mounting:

`willMount({props, children})`

`create({props, children})`
- returns state for the entity.

`didCreate({props, state, children})`

`render({props, state, children})`

`didMount`

When updating:

`willUpdate({nextProps, props, nextChildren, children, nextState, state})`

`update()`

`didUpdate({prevProps, prevChildren, prevState, props, children, state})`

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
