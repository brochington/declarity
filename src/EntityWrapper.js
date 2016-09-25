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

class EntityInstance {
    constructor(entityClass, props, children, passedActions, isFirstInTree) {
        this.entityClass = entityClass;
        this.entity = new entityClass();
        this.isFirstInTree = isFirstInTree;

        this.entity.props = props;
        this.entity.children = children;

        if (entityClass.actions) {
            // Might want to pass isFirstInTree to StateManager.

            this.stateManager = new StateManager();

            this.stateManager.init(
                {...passedActions, ...entityClass.actions},
                () => {return {};}, // initial state...
                (state, actions) => this.updateState(state)
            );

            this.entity.actions = this.stateManager.actions;
        }

        else {
            this.entity.actions = passedActions;
        }

    }

    // should this be async?
    mount = (props, children) => {
        this.entity.props = props;
        this.entity.children = children;

        // willMount
        if (has('willMount', this.entity)) {
            this.entity.willMount();
        }

        // didMount
        if (has('didMount', this.entity)) {
            this.entity.didMount();
        }

        // create
        if (has('create', this.entity)) {
            const createdState = this.entity.create();
            // handle async stuff here.
        }

        // didCreate
        if (has('didCreate', this.entity)) {
            this.entity.didCreate();
            // handle async stuff here.
        }

        // mount the children
        if (has('render', this.entity)) {
            //TODO: will need to add checks for other values besides <Entity> and null in render array.
            const renderContent = this.entity.render();

            if (renderContent && renderContent.length && renderContent.length > 0) {
                this.childEntities = handleRenderContent(renderContent, this.stateManager.actions);

                // mount children
                this.childEntities.map((childEntity) => {
                    childEntity.entityInstance.mount(childEntity.props, childEntity.children);
                });
            }

            // assume that no children have been mounted yet.

        }

        // run willMount stuff
        // run create() method, which can return a function, promise, generator, etc.
        // does
        // Get rendered content.

    }

    _update = (stuff) => {
        console.log('internal update', stuff);
    }

    update = () => {
        if (this.childEntities) {

            // get new rendered children.
            const newContent = rejectNil(this.entity.render());
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
                this.childEntities = generateChildEntities(this.childEntities, newContent, this.stateManager.actions);
            }
        }

        // willUpdate
        if (has('willUpdate', this.entity)) {
            this.entity.update();
        }

        // update
        // The update process might be the "pipeline" that I've been thinking of.
        if (has('update', this.entity)) {
            this.entity.props = this.props;
            this.entity.children = this.children;
            this.entity.update();
        }

        // didUpdate
        if (has('didUpdate', this.entity)) {
            this.entity.didUpdate();
        }

    }

    updateState = (newState) => {
        if (this.isFirstInTree) {
            this.entity.appState = newState;
        }

        this.entity.state = newState;

        this.update();
    }

    _remove = () => {
        // Figure out if anything needs to happen here.
        if (has('willUnmount', this.entity)) {
            this.entity.willUnmount();
        }
    }

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

export default EntityInstance;
