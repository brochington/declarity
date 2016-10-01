import {createRandomString} from './helpers/string';
import {isNil, isArray, flatten} from 'lodash';

class Entity {
    entityId = createRandomString()

    get props() {
        return this._props;
    }

    set props(props) {
        this._props = isNil(props) ? {} : props;
    }

    get children() {
        return this._children;
    }

    set children(children) {
        this._children = isArray(children) ? flatten(children) : [];
    }
}

export default Entity;
