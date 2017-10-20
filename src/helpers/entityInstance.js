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
  equals,
} from 'ramda';

import { rejectNil, contentByKey, onlyObjects, isArray } from './functional';

import EntityWrapper from '../EntityWrapper';

export function diffComponents(oldContent, newContent) {
  const newHashMap = contentByKey(newContent);
  const oldHashMap = contentByKey(oldContent);

  const added = [];
  const updated = [];
  const removed = [];

  for (let i = 0; i < newContent.length; i++) {
    const c = newContent[i];

    if (!Object.prototype.hasOwnProperty.call(oldHashMap, c.key)) {
      added.push(c);
    }
  }

  for (let i = 0; i < oldContent.length; i++) {
    const c = oldContent[i];

    if (Object.prototype.hasOwnProperty.call(newHashMap, c.key)) {
      updated.push([c, newHashMap[c.key]]);
    }

    if (!Object.prototype.hasOwnProperty.call(newHashMap, c.key)) {
      removed.push(c);
    }
  }

  return {
    added,
    updated,
    removed,
  };
}

export function mountChild(childEntity) {
  childEntity.entityInstance.mount(
    childEntity.props,
    childEntity.children,
    childEntity.context
  );
  return childEntity;
}

export const updateChild = ([oldChild, newChild]) => {
  const newProps = isNil(newChild.props) ? {} : newChild.props;
  const newChildren = isArray(newChild.children)
    ? flatten(newChild.children)
    : [];
  const newContext = isNil(newChild.context) ? {} : newChild.context;

  oldChild.entityInstance.updateParams(newProps, newChildren, newContext);
  oldChild.entityInstance.update();

  return oldChild;
};

export function prepareChildContentForMounting({
  entityClass,
  props,
  children,
  context,
}) {
  return {
    entityClass,
    props,
    key: props.key,
    children,
    entityInstance: new EntityWrapper(entityClass),
    entityClassName: entityClass.name,
    context,
  };
}

export const mountChildren = pipe(
  rejectNil,
  map(prepareChildContentForMounting),
  map(mountChild)
);

export function updateChildren(childrenToUpdate) {
  const updatedChildren = [];

  for (let i = 0; i < childrenToUpdate.length; i++) {
    updatedChildren.push(updateChild(childrenToUpdate[i]));
  }

  return updatedChildren;
}

export function removeChild({ entityInstance }) {
  entityInstance.remove();
}

export function removeChildren(childrenToRemove) {
  for (let i = 0; i < childrenToRemove.length; i++) {
    removeChild(childrenToRemove[i]);
  }
  return;
}

export function generateChildEntities(oldContent, newContent) {
  const { added, updated, removed } = diffComponents(oldContent, newContent);

  removed.length > 0 && removeChildren(removed);
  const addedEntities = mountChildren(added);
  const updatedEntities = updateChildren(updated);

  return addedEntities.concat(updatedEntities);
}

export const getRenderContent = (entity, params) => {
  if (!has('render', entity)) return [];
  const content = entity.render(params);
  if (isNil(content)) return [];

  const contentArray = isArray(content)
    ? content
    : has('key', content) ? [content] : [];

  return onlyObjects(contentArray);
};

export const callMethodInSystems = (methodName, systemParams) => {
  let { systems } = systemParams.props;
  let newParams = Object.assign({}, systemParams);

  for (let i = 0; i < systems.length; i++) {
    let system = systems[i];
    let systemResult;

    /*
      Accept a function as well as an object for systems.
      If passed a function, then call it on create and update.
    */

    if (
      system instanceof Function &&
      (methodName === 'create' || methodName === 'update')
    ) {
      systemResult = system(newParams);
    } else if (system[methodName] instanceof Function) {
      systemResult = system[methodName](newParams);
    }

    if (typeof systemResult === 'object') {
      newParams = Object.assign({}, newParams, {
        state: Object.assign({}, newParams.state, systemResult),
      });
    }
  }

  return newParams;
};
