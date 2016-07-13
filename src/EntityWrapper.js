import StateManager from './StateManager';
import {isNil, isArray, forEach, flatten} from 'lodash';



/* Recusively call a method on all children */
function callMethodOnChildren(methodName, children) {
    // console.log('callMethodOnChildren', children);
    if (!isArray(children) || children.length <= 0) {
        return;
    }

    forEach(children, child => {
        if (child.hasOwnProperty(methodName) && typeof child[methodName] === 'function') {
            child[methodName]();
        }
    })
}

function getRenderContent(entityClassInstance) {
    const content = entityClassInstance.render();

    if (isNil(content)) return [];

    return isArray(content)? content : [content];
}

class EntityWrapper {
    constructor(entityClass, props, children){
        props = isNil(props) ? {} : props;
        children = isArray(children) ? flatten(children) : [];

        this.entityClass = entityClass;
        this.props = props;
        this.children = children;
        this.systems = props.hasOwnProperty('systems') && Array.isArray(props.systems)
                           ? props.systems
                           : [];

        if (entityClass.hasOwnProperty('actions')) {
            this.stateManager = new StateManager();

            this.stateManager.init(
                entityClass.actions,
                () => {return {};}, // initial state...
                (state, actions) => this.updateStuff(state)
            )
        }
    }

    updateStuff = (state) => {
        console.log('updateStuff, yo', state, this);

    }

    // called when entity is mounted.
    mount = () => {
        this._entityClassInstance = new this.entityClass();

        if (this._entityClassInstance.hasOwnProperty('willMount')) {
            this._entityClassInstance.willMount(); // pass any props here?
        }

        // console.log("this._entityClassInstance.hasOwnProperty('render')", this._entityClassInstance.render);
        // console.dir(this._entityClassInstance);
        const renderContent = typeof this._entityClassInstance.render === 'function'
                                  ? getRenderContent(this._entityClassInstance)
                                  : this.children;

        // console.log('renderContent', renderContent);
        callMethodOnChildren('mount', renderContent);

        if (this._entityClassInstance.hasOwnProperty('didMount')) {
            this._entityClassInstance.didMount(); // pass any props here?
        }
    }

    unmount = () => {
        if (this._entityClassInstance.hasOwnProperty('willUnmount')) {
            this._entityClassInstance.willUnmount(); // pass any props here?
        }

        // callMethodOnChildren('unmount', this.children);

        if (this._entityClassInstance.hasOwnProperty('didUnmount')) {
            this._entityClassInstance.didUnmount(); // pass any props here?
        }
    }
}

export default EntityWrapper;
