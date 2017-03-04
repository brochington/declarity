import {
    map,
    reduce,
    filter,
    zip,
    pipe,
    isNil,
    assoc,
    has,
    is,
    mapObjIndexed,
    flatten,
    equals
} from 'ramda';

import {
    rejectNil,
    contentByKey,
    onlyObjects,
    isArray
} from './helpers/functional';

const createEntityInstanceObjects = map(({entityClass, props, children, context}) => {
    const entityInstance = new EntityWrapper(entityClass);

    return {
        entityClass,
        props,
        key: props.key,
        children,
        entityInstance,
        entityClassName: entityClass.name,
        context
    }
});

const handleRenderContent = pipe(
    rejectNil,
    createEntityInstanceObjects
);

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
    const newContext = isNil(newChild.context) ? {} : newChild.context;

    oldChild.entityInstance.previousProps = oldChild.props;
    oldChild.entityInstance.props = newProps;

    oldChild.entityInstance.previousChildren = oldChild.children;
    oldChild.entityInstance.children = newChildren;

    oldChild.entityInstance.previousContext = oldChild.context;
    oldChild.entityInstance.context = newContext;

    oldChild.entityInstance.update();

    return oldChild;
}

const mountChildren = map((childEntity) => {
    childEntity.entityInstance.mount(childEntity.props, childEntity.children, childEntity.context);
    return childEntity;
});

const processAddedContent = pipe(handleRenderContent, mountChildren)

const processUpdatedContent = map(updateChild);

const processRemovedContent = map(({entityInstance}) => entityInstance.remove())

const generateChildEntities = (oldContent, newContent) => {
    const {added, updated, removed} = diffComponents(oldContent, newContent);

    const addedEntities = processAddedContent(added);
    const updatedEntities = processUpdatedContent(updated);
    removed.length > 0 && processRemovedContent(removed);

    return addedEntities.concat(updatedEntities)
}

const getRenderContent = (entity, params) => {
    const content = entity.render(params);
    if (isNil(content)) return [];

    const contentArray = isArray(content)
                            ? content
                            : has('key', content)
                                ? [content]
                                : [];

    return onlyObjects(contentArray);
}

const callMethodInSystems = (methodName, systemParams) => {
    return systemParams.props.systems.reduce((acc, system, i) => {
        if (has(methodName, system) && is(Function, system[methodName])) {
            const systemResult = system[methodName](acc)

            if (is(Object, systemResult)) {
                return {...acc, state: {...acc.state, ...systemResult}}
            }
        }

        return acc
    }, systemParams)
}

class EntityWrapper {
    constructor(entityClass) {
        this.entityClass = entityClass;
        this.entity = new entityClass();
    }

    mount = async (props, children, context = {}) => {
        this.props = props;
        this.children = children;
        this.context = context;
        this.shouldUpdate = false;

        const passedParams = {
            props,
            children,
            context,
            setState: this.setState
        }

        // willMount
        if (has('willMount', this.entity)) {
            this._callingWillMount = true;
            this.entity.willMount(passedParams);
            this._callingWillMount = false;
        }

        // create
        if (has('create', this.entity)) {
            this._callingCreate = true;
            const initState = this.entity.create(passedParams);

            if (has('systems', this.props)) {
                const systemParams = {...passedParams, state: initState};

                const systemsState = callMethodInSystems('create', systemParams);

                this._callingCreate = false;
                this.setState(systemsState.state);
            }

            else {
                this._callingCreate = false;
                this.setState(initState);
            }


        }

        this.shouldUpdate = true;

        const passedParamsWithState = {
            props: this.props,
            children: this.children,
            state: this.state,
            context: this.context
        }

        // didCreate
        if (has('didCreate', this.entity)) {
            const didCreateParams = {
                ...passedParamsWithState,
                setState: (newState) => {
                    console.log('didCreate setState', newState);
                    this.shouldUpdate = false;

                    this.setState(newState);
                    this.shouldUpdate = true;
                }
            }
            this.entity.didCreate(didCreateParams);
            // handle async stuff here.
        }

        // mount the children
        if (has('render', this.entity)) {
            //TODO: will need to add checks for other values besides <Entity> and null in render array.
            let childContext = this.context;

            this._callingRender = true;
            let renderContent = getRenderContent(this.entity, passedParamsWithState);
            this._callingRender = false;

            if (renderContent && renderContent.length && renderContent.length > 0) {
                if (has('getChildContext', this.entity)) {
                    const childContextVal = this.entity.getChildContext(passedParamsWithState)

                    if (!isNil(childContextVal)) {
                        childContext = {
                            ...childContext,
                            ...childContextVal
                        }
                    }

                    renderContent = renderContent.map(content => {
                        content.context = childContext
                        return content;
                    })
                }

                this.childEntities = handleRenderContent(renderContent);

                // mount children
                this.childEntities.map((childEntity) => {
                    childEntity.entityInstance.mount(childEntity.props, childEntity.children, childContext);
                });
            }

        }

        // didMount
        if (has('didMount', this.entity)) {
            this.entity.didMount(passedParamsWithState);
        }
    }

    update = () => {
        // shouldUpdate
        if (has('shouldUpdate', this.entity)) {
            const shouldUpdateResult = this.entity.shouldUpdate()

            if (typeof shouldUpdateResult === "boolean") {
                if (!shouldUpdateResult) {
                    return;
                }
            }
        }

        this.shouldUpdate = false;

        // willUpdate
        if (has('willUpdate', this.entity)) {
            this._callingWillUpdate = true;
            this.entity.willUpdate(this.getEntityParams());
            this._callingWillUpdate = false;
        }

        // update
        // The update process might be the "pipeline" that I've been thinking of.
        if (has('update', this.entity)) {
            this._callingUpdate = true;
            const entityParams = this.getEntityParams();

            let updatedState = this.entity.update({...this.getEntityParams()});

            if (has('systems', entityParams.props)) {
                const systemsParams = updatedState
                                          ? {...this.getEntityParams(), state: updatedState}
                                          : this.getEntityParams()

                const newSystemsParams = callMethodInSystems('update', systemsParams)

                updatedState = {...updatedState, ...newSystemsParams.state}
            }

            this._callingUpdate = false;

            if (!isNil(updatedState)) {
                this.setState(updatedState)
            }
        }

        // didUpdate
        if (has('didUpdate', this.entity)) {
            this._callingDidUpdate = true;
            this.entity.didUpdate(this.getEntityParams());
            this._callingDidUpdate = false;
        }

        if (this.childEntities) {
            // get new rendered children.

            let childContext = this.context;

            if (has('getChildContext', this.entity)) {
                const childContextVal = this.entity.getChildContext(this.getEntityParams())
                if (!isNil(childContextVal)) {
                    childContext = {...childContext, ...childContextVal}
                }
            }

            this._callingRender = true;
            const newContent = getRenderContent(this.entity, this.getEntityParams()).map((content) => {
                content.context = childContext;
                return content;
            });
            // console.log(newContent)
            this._callingRender = false;

            // If entityClassNames are same, then we can assume that this level didn't change.
            // Can add extra checks for props later, or put those in the component.
            const oldComponentNames = this.childEntities.map(child => child.entityClass.name);
            const newComponentNames = newContent.map(child => child.entityClassName);

            if (equals(oldComponentNames, newComponentNames)) {
                // No add/remove of components is needed.
                // Just update Props.
                const zippedChildren = zip(this.childEntities, newContent);

                this.childEntities = map(updateChild, zippedChildren);
            }

            else {
                this.childEntities = generateChildEntities(this.childEntities, newContent);
            }
        }

        this.shouldUpdate = true;
    }

    setState = (newState: any) => {
        // console.log('setState', this.entity)
        // console.log('ss', this.shouldUpdate);
        if (this._callingWillMount) {
            console.log('trying to call setState in willMount. This is a noop', this.entity);
            return;
        }

        if (this._callingCreate) {
            console.log('trying to call setState in create(). This is a noop', this.entity);
            return;
        }

        if (this._callingUpdate) {
            console.log('trying to call setState in update(). This is a noop. please have the update() method return any updated state.', this.entity);
            return;
        }

        this.previousState = this.state;

        this.state = {
            ...this.state,
            ...newState
        }

        if (this.shouldUpdate) {
            // Note: Don't know if setting previous stuff here is proper.
            this.previousProps = this.props;
            this.previousChildren = this.children;
            this.update();
        }
    }

    remove = () => {
        // Figure out if anything needs to happen here.
        if (has('willUnmount', this.entity)) {
            this.entity.willUnmount(this.getEntityParams());
        }

        if (has('didUnmount', this.entity)) {
            this.entity.didUnmount(this.getEntityParams())
        }
    }

    getEntityParams = () => {
        let entityParams = {
            previousProps: this.previousProps,
            previousChildren: this.previousChildren,
            previousState: this.previousState,
            previousContext: this.previousContext,
            props: this.props,
            children: this.children,
            context: this.context,
            state: this.state,
            setState: this.setState
        }

        return entityParams;
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

export default EntityWrapper;
