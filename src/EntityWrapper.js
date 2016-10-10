import StateManager from './StateManager';
import {isArray, flatten, isEqual, zip} from 'lodash';

import {
    map,
    pipe,
    isNil,
    assoc,
    has,
    reduce,
    mapObjIndexed
} from 'ramda';
import {rejectNil, contentByKey} from './helpers/functional';
import {sync} from './helpers/async';

const createEntityInstanceObjects = map(({entityClass, props, children}) => {
    const entityInstance = new EntityInstance(entityClass, props, children);

    return {
        entityClass,
        props,
        key: props.key,
        children,
        entityInstance,
        entityClassName: entityClass.name
    }
});

const handleRenderContent = (content) => pipe(
    rejectNil,
    createEntityInstanceObjects
)(content);

const diffComponents = (oldContent, newContent) => {
    const newHashMap = contentByKey(newContent);
    const oldHashMap = contentByKey(oldContent);

    const added = reduce((acc, c) => {
        if (!has(c.key, oldHashMap)) {
            acc.push(c)
        }
        return acc;
    }, [], newContent);

    const updated = reduce((acc, c) => {
        if (has(c.key, newHashMap)) {
            acc.push([c, newHashMap[c.key]]);
        }
        return acc;
    }, [], oldContent);

    const removed = reduce((acc, c) => {
        if (!has(c.key, newHashMap)) {
            acc.push(c);
        }
        return acc;
    }, [], oldContent);

    return {
        added,
        updated,
        removed
    }
}

const updateChild = ([oldChild, newChild]) => {
    const newProps = isNil(newChild.props) ? {} : newChild.props;
    const newChildren = isArray(newChild.children) ? flatten(newChild.children) : [];

    // oldChild.appState = this.entity.appState;
    // oldChild.entityInstance.entity.appState = this.entity.appState;

    oldChild.props = newProps;
    oldChild.entityInstance.props = newProps;

    oldChild.children = newChildren;
    oldChild.entityInstance.newChildren;

    oldChild.entityInstance.update();

    return oldChild;
}

const mountChildren = map((childEntity) => {
    childEntity.entityInstance.mount(childEntity.props, childEntity.children);
    return childEntity;
});

const processAddedContent = (addContent) => {
    const newEntities = handleRenderContent(addContent);
    return mountChildren(newEntities);
}

const processUpdatedContent = map(updateChild);

const processRemovedContent = map(({entityInstance}) => entityInstance._remove())

const generateChildEntities = (oldContent, newContent) => {
    const {added, updated, removed} = diffComponents(oldContent, newContent);

    const addedEntities = processAddedContent(added);
    const updatedEntities = processUpdatedContent(updated);
    removed.length > 0 && processRemovedContent(removed);

    return addedEntities.concat(updatedEntities)
}

const getRenderContent = (entity, params) => {
    const content = entity.render(params);
    const contentArray = isArray(content)
                            ? content
                            : has('key', content)
                                ? [content]
                                : [];

    return rejectNil(contentArray);
}

class EntityInstance {
    constructor(entityClass, props, children) {
        this.entityClass = entityClass;
        this.entity = new entityClass();

        this.entity.props = props;
        this.entity.children = children;

        // const entityClassActions = this.entity.actions || {};
        // Might want to pass isFirstInTree to StateManager.
        // this.stateManager = new StateManager();
        //
        // this.stateManager.init(
        //     {...passedActions, ...entityClassActions},
        //     () => {return {};}, // initial state...
        //     (state, actions) => this.updateState(state)
        // );
        //
        // this.actions = this.stateManager.getActions();
        // this.setStateActions = mapObjIndexed((action, actionName) => {
        //     return action.then((newState) => this.stateManager.callSetStateCallback(newState))
        // }, this.stateManager.getActions())
    }

    // should this be async?
    mount = async (props, children) => {
        this.entity.props = props;
        this.entity.children = children;

        this.props = props;
        this.children = children;

        const passedParams = {
            // actions: this.actions,
            props,
            children
        }

        // willMount
        if (has('willMount', this.entity)) {
            this.entity.willMount(passedParams);
        }

        // create
        if (has('create', this.entity)) {
            const initState = await this.entity.create(passedParams);
            this.setState(initState);
        }

        this.afterStateCreated();
    }

    afterStateCreated = (state) => {
        this.shouldUpdate = true;

        const passedParamsWithState = {
            props: this.props,
            children: this.children,
            state: this.state
        }

        // didCreate
        if (has('didCreate', this.entity)) {
            this.entity.didCreate(passedParamsWithState);
            // handle async stuff here.
        }

        // mount the children
        if (has('render', this.entity)) {
            //TODO: will need to add checks for other values besides <Entity> and null in render array.
            const renderContent = getRenderContent(this.entity, passedParamsWithState);

            if (renderContent && renderContent.length && renderContent.length > 0) {
                this.childEntities = handleRenderContent(renderContent, this.entity.actions);

                // mount children
                this.childEntities.map((childEntity) => {
                    childEntity.entityInstance.mount(childEntity.props, childEntity.children);
                });
            }
        }

        // didMount
        if (has('didMount', this.entity)) {
            this.entity.didMount(passedParamsWithState);
        }
    }

    update = async () => {
        const willUpdateActions = mapObjIndexed((action, actionName) => {
            return (...args) => {
                this.currentActions.push({
                    action,
                    actionName,
                    args
                });
            }
        }, this.actions);
        const prevState = this.state;

        const nextParams = {
            nextProps: {...this.props},
            nextChildren: this.children,
            state: this.state
        };

        // willUpdate
        if (has('willUpdate', this.entity)) {
            await this.entity.willUpdate(nextParams);

            this.currentActions = [];
        }

        if (this.childEntities) {

            // get new rendered children.
            const newContent = getRenderContent(this.entity, {
                props: {...this.props},
                children: this.children,
                state: this.state
            });
            // If entityClassNames are same, then we can assume that this level didn't change.
            // Can add extra checks for props later, or put those in the component.
            const oldComponentNames = this.childEntities.map(child => child.entityClass.name);
            const newComponentNames = newContent.map(child => child.entityClassName);

            if (isEqual(oldComponentNames, newComponentNames)) {
                // No add/remove of components is needed.
                // Just update Props.
                const zippedChildren = zip(this.childEntities, newContent);

                this.childEntities = map(updateChild, zippedChildren);
            }

            else {
                this.childEntities = generateChildEntities(this.childEntities, newContent);
            }
        }

        const prevParams = {
            prevProps : {...this.entity.props},
            prevChildren: this.entity.children,
            prevState
        }


        // update
        // The update process might be the "pipeline" that I've been thinking of.
        if (has('update', this.entity)) {
            this.entity.update(nextParams);

            this.entity.props = this.props;
            this.entity.children = this.children;
        }

        // didUpdate
        if (has('didUpdate', this.entity)) {
            this.entity.didUpdate(prevParams);
        }
    }

    setState = (newState: any) => {
        this.state = newState;

        if (this.shouldUpdate) {
            this.update();
        }
    }

    _remove = () => {
        // Figure out if anything needs to happen here.
        if (has('willUnmount', this.entity)) {
            this.entity.willUnmount();
        }
    }

    get props(): Object {
        return this._props;
    }

    set props(props: Object) {
        this._props = isNil(props) ? {} : props;
    }

    get children(): Array {
        return this._children;
    }

    set children(children: ?Array): void {
        this._children = isArray(children) ? flatten(children) : [];
    }
}

export default EntityInstance;
