import {isNil, isArray, flatten, isEqual, zip} from 'lodash';

const hasMethod = (methodName, instance) => {
    return instance.hasOwnProperty(methodName)
};

const handleRenderContent = (content) => {
    return content.map(({entityClass, props, children}) => {
        return {
            entityClass,
            props,
            children,
            entityInstance: new EntityInstance(entityClass, props, children)
        }
    });
}

class EntityInstance {
    constructor(entityClass, props, children) {
        this.entityClass = entityClass;
        this.entity = new entityClass();

        this.entity.props = props;
        this.entity.children = children;
    }

    // should this be async?
    mount = (props, children) => {
        this.entity.props = props;
        this.entity.children = children;

        // willMount
        if (hasMethod('willMount', this.entity)) {
            this.entity.willMount();
        }

        // didMount
        if (hasMethod('didMount', this.entity)) {
            this.entity.didMount();
        }

        // create
        if (hasMethod('create', this.entity)) {
            const createdState = this.entity.create();
            // handle async stuff here.
        }

        // didCreate
        if (hasMethod('didCreate', this.entity)) {
            this.entity.didCreate();
            // handle async stuff here.
        }

        // mount the children
        if (hasMethod('render', this.entity)) {
            const renderContent = this.entity.render();

            if (renderContent && renderContent.length && renderContent.length > 0) {
                this.childEntities = handleRenderContent(renderContent);

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

    update = () => {
        if (this.childEntities) {

            // get new rendered children.
            const newContent = this.entity.render();

            // If entityClassNames are same, then we can assume that this level didn't change.
            // Can add extra checks for props later, or put those in the component.
            const oldComponentNames = this.childEntities.map(child => child.name);
            const newComponentNames = newContent.map(child => child.name);

            if (isEqual(oldComponentNames, newComponentNames)) {
                const zippedChildren = zip(this.childEntities, newContent);

                this.childEntities = zippedChildren.map(([oldChild, newChild]) => {
                    const newProps = isNil(newChild.props) ? {} : newChild.props;
                    const newChildren = isArray(newChild.children) ? flatten(newChild.children) : [];

                    oldChild.props = newProps;
                    oldChild.entityInstance.props = newProps;

                    oldChild.children = newChildren;
                    oldChild.entityInstance.newChildren;
                    // console.log('this.far');
                    oldChild.entityInstance.update();

                    // Might want to call "willUpdate" and such here.
                    return oldChild;
                });
            }
        }

        // willUpdate
        if (hasMethod('willUpdate', this.entity)) {
            this.entity.update();
        }

        // update
        // The update process might be the "pipeline" that I've been thinking of.
        if (hasMethod('update', this.entity)) {
            this.entity.props = this.props;
            this.entity.children = this.children;
            this.entity.update();
        }

        // didUpdate
        if (hasMethod('didUpdate', this.entity)) {
            this.entity.didUpdate();
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
