// @flow
import danger from './danger';
import { is } from 'ramda';
import Entity from './Entity';

const knownEntityTypes = {
  entity: Entity,
};

export const createEntity = (
  entityClass: any,
  props: any,
  ...children: any
) => {
  // TODO: Do better error handling!
  // TODO: is there a way to not have keys on every entity, or to infer them?

  const entityClassIsString = typeof entityClass == 'string';

  danger(
    !entityClassIsString ||
      (entityClassIsString && knownEntityTypes[entityClass]),
    `EntityClass is neither usable class, or a know entity type. Please check ${entityClass} with key ${props.key}`
  );

  const newEntityClass = entityClassIsString
    ? knownEntityTypes[entityClass]
    : entityClass;

  return {
    entityClass: newEntityClass,
    entityClassName: newEntityClass.name,
    props,
    key: props && props.key ? props.key : entityClass.name + '-no-key',
    children,
  };
};
