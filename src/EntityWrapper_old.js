import StateManager from './StateManager';
import {isNil, isArray, forEach, flatten, isEqual} from 'lodash';

function callMethodOnChildren(methodName, children, ...args) {
    if (!isArray(children) || children.length <= 0) {
        return;
    }

    forEach(children, child => {
        if (child.hasOwnProperty(methodName) && typeof child[methodName] === 'function') {
            child[methodName](...args);
        }
    })
}

function getRenderContent(entityClassInstance) {
    const content = entityClassInstance.render();
    // console.log('renderContent');
    // console.log(content);
    if (isNil(content)) return [];

    return isArray(content) ? content : [content];
}

function CompareRenderContent(oldContent, newContent) {
    console.log("CompareRenderContent", oldContent, newContent);
    // Are they the same length? if so, then no Components have been added/removed
    const oldComponentNames = oldContent.map(c => c.entityClass.name);
    const newComponentNames = newContent.map(c => c.entityClass.name);
    console.log(oldComponentNames, newComponentNames);
    console.log('names eq', isEqual(oldComponentNames, newComponentNames));

}

const internalActions = {
    // TODO: add support for createFunc as an async/await function
    _createEntity: (state, actions, entityClass, entityId) => {
        const created = entityClass.create(state);
        let newState = state();

        newState[entityId] = created;

        entityClass.didMount && entityClass.didMount();

        return newState;
    }
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

        // if (entityClass.hasOwnProperty('actions')) {
        this.stateManager = new StateManager();

        this.stateManager.init(
            {...entityClass.actions, ...internalActions},
            () => {return {};}, // initial state...
            (state, actions, ss) => this.updateState(state)
        );
        // }
    }

    updateState = (state) => {
        // console.log('updateStuff, yo', state, this);
        // console.log(this.stateManager.state[this._entityClassInstance.entityId]);
        // Does the state manager have state object with the entityId of the entity instance?
        // if (this.stateManager.state[this._entityClassInstance.entityId]) {
        //     this._entityClassInstance.actions = this.stateManager.actions;
        //     this.update();
        // }
        // this._entityClassInstance.actions = this.stateManager.actions;

        this.update();
    }

    mount = (parentArgs = {}) => {
        const {parentActions} = parentArgs;
        const combinedActions = {
            ...(parentActions ? parentActions : {}),
            ...(this.stateManager ? this.stateManager.actions : {})
        };

        this._entityClassInstance = new this.entityClass();
        this._entityClassInstance.actions = combinedActions;

        if (this._entityClassInstance.hasOwnProperty('willMount')) {
            this._entityClassInstance.willMount(); // pass any props here?
        }

        const {entityId} = this._entityClassInstance;

        // handle create method
        if (typeof this._entityClassInstance.create === 'function') {
            this.stateManager.actions._createEntity(this._entityClassInstance, entityId);
        }


        const renderContent = typeof this._entityClassInstance.render === 'function'
                                  ? getRenderContent(this._entityClassInstance)
                                  : this.children;
        this._oldRenderContent = renderContent;

        callMethodOnChildren('mount', renderContent, {
            parentActions: combinedActions
        });

        // if (this._entityClassInstance.hasOwnProperty('didMount')) {
        //     console.log('did mount...');
        //     this._entityClassInstance.didMount(); // pass any props here?
        // }
    }

    processSystems = async () => {
        this.systems.map((system) => {
            if (typeof system === 'function') {
                console.log('system is a function');
                // call system.
            }
            console.log("running through", system);
        })
    }

    update = async () => {
        // console.log('update');
        if (this._entityClassInstance.hasOwnProperty('willUpdate')) {
            this._entityClassInstance.willUpdate(); // pass any props here?
        }
        // need to call the "systems".
        await this.processSystems();

        // refetch the content of the render method. Inject props, and local state..
        if (this._entityClassInstance.hasOwnProperty('update')) {
            this._entityClassInstance.update();
        }

        if (this._entityClassInstance.hasOwnProperty('didUpdate')) {
            this._entityClassInstance.didUpdate();
        }
        // console.log('this', this);
        if(this._entityClassInstance.hasOwnProperty('render')) {
            const renderContent = this._entityClassInstance.render();
            console.log('this', this);
            CompareRenderContent(this._oldRenderContent, renderContent);
            console.log('result, dude');
            // console.log(result);
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
