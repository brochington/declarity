import StateManager from './StateManager';
import {isArray, flatten, isEqual, zip} from 'lodash';

import {map, pipe, isNil, assoc, has, reduce} from 'ramda';
import {rejectNil} from './helpers/functional';

const createEntityInstanceObjects = map(({entityClass, props, children, passedActions}) => {
    const entityInstance = new EntityInstance(entityClass, props, children, passedActions, false);

    return {
        entityClass,
        props,
        key: props.key,
        children,
        entityInstance,
        entityClassName: entityClass.name
    }
});

const handleRenderContent = (content, passedActions) => pipe(
    rejectNil,
    map(assoc('passedActions', passedActions)),
    createEntityInstanceObjects
)(content);

const _contentByKey = (acc, v) => {
    acc[v.key] = v;
    return acc;
}

const contentByKey = (content) => reduce(_contentByKey, {}, content);

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

const processAddedContent = (addContent, passedActions) => {
    const newEntities = handleRenderContent(addContent, passedActions);
    return mountChildren(newEntities);
}

const processUpdatedContent = map(updateChild);

const processRemovedContent = map(({entityInstance}) => entityInstance._remove())

const generateChildEntities = (oldContent, newContent, passedActions) => {
    const {added, updated, removed} = diffComponents(oldContent, newContent);

    const addedEntities = processAddedContent(added, passedActions);
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
    constructor(entityClass, props, children, passedActions = {}, isFirstInTree) {
        this.entityClass = entityClass;
        this.entity = new entityClass();
        this.isFirstInTree = isFirstInTree;

        this.entity.props = props;
        this.entity.children = children;

        const entityClassActions = this.entity.actions || {};
        // Might want to pass isFirstInTree to StateManager.
        this.stateManager = new StateManager();

        this.stateManager.init(
            {...passedActions, ...entityClassActions},
            {create: this.createState},
            () => {return {};}, // initial state...
            (state, actions) => this.updateState(state)
        );

        this.actions = this.stateManager.getActions();
    }

    // should this be async?
    mount = (props, children) => {
        this.entity.props = props;
        this.entity.children = children;

        this.props = props;
        this.children = children;

        const passedParams = {
            actions: this.actions,
            props,
            children
        }

        // willMount
        if (has('willMount', this.entity)) {
            this.entity.willMount(passedParams);
        }


        // create
        if (has('create', this.entity)) {
            this.stateManager.getPrivateActions().create(passedParams, this);
        }

        else {
            this.afterStateCreated();
        }
    }

    afterStateCreated = (state) => {
        this.shouldUpdate = true;

        const passedParamsWithState = {
            props: this.props,
            children: this.children,
            actions: this.actions,
            state
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

    _update = (stuff: any) => {
        console.log('internal update', stuff);
    }

    update = () => {
        const nextParams = {
            nextProps: {...this.props},
            nextChildren: this.children,
            actions: this.actions,
            state: this.stateManager.getState()
        };

        if (this.childEntities) {


            // willUpdate
            if (has('willUpdate', this.entity)) {
                this.entity.willUpdate(nextParams);
            }

            // get new rendered children.
            const newContent = getRenderContent(this.entity, {
                props: {...this.props},
                children: this.children,
                actions: this.actions,
                state: this.stateManager.getState()
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
                this.childEntities = generateChildEntities(this.childEntities, newContent, this.entity.actions);
            }
        }

        const prevParams = {
            prevProps : {...this.entity.props},
            prevChildren: this.entity.children,
            actions: this.actions
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

    updateState = (newState: Object) => {
        if (this.isFirstInTree) {
            this.entity.appState = newState;
        }

        this.entity.state = newState;

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

    createState = async (state, actions, passedParams, ctx): Object => {
        ctx.shouldUpdate = false;

        const newState = await ctx.entity.create(passedParams);

        ctx.afterStateCreated(newState);

        return newState;
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

    get state(): Object {
        return this._createdState;
    }
}

export default EntityInstance;
