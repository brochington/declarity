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

`willMount`

`create`

`didCreate`

`render`

`didMount`

When updating:

`willUpdate`

`update`

`didUpdate`

When being destructed:

`willUnmount`



## register

user to register an Entity class

i.e:

```
import {register} from 'declarity'
import App from 'App'

register(<App />)
```
