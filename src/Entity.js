import {createRandomString} from './helpers/string';
import {isNil, isArray, flatten} from 'lodash';

class Entity {
    entityId = createRandomString()

    get props(): Object {
        return this._props;
    }

    set props(props: ?Object) {
        this._props = isNil(props) ? {} : props;
    }

    get children(): Array {
        return this._children;
    }

    set children(children: ?Array) {
        this._children = isArray(children) ? flatten(children) : [];
    }
}

export default Entity;
