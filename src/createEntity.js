// @flow
import danger from './danger';
import { is } from 'ramda';
import Entity from './Entity';

const knownEntityTypes: Object = {
  entity: Entity,
};

export const createEntity = (
  entityClass: string | Function,
  props: Object,
  ...children: Array<Object>
) => {
  // TODO: Do better error handling!
  // TODO: is there a way to not have keys on every entity, or to infer them?

  const entityClassIsString = typeof entityClass == 'string';

  danger(
    !entityClassIsString ||
      (entityClassIsString && knownEntityTypes[entityClass]),
    `EntityClass is neither usable class, or a know entity type. Please check ${entityClass.toString()} with key ${props.key}`
  );

  if (entityClassIsString) {
    const newEntityClass = knownEntityTypes[entityClass];

    return {
      entityClass: newEntityClass,
      entityClassName: newEntityClass.name,
      props,
      key: props && props.key ? props.key : newEntityClass.name + '-no-key',
      children,
    };
  } else if (typeof entityClass === 'function') {
    return {
      entityClass,
      entityClassName: entityClass.name,
      props,
      key: props && props.key ? props.key : entityClass.name + '-no-key',
      children,
    };
  }
};
