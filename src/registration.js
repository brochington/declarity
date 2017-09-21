/* @flow */
import danger from './danger';
import EntityWrapper from './EntityWrapper';

const registeredEntities: Map<string, EntityWrapper> = new Map();
const registeredEntitiesLock = new Set();

export const getRegisteredEntities = (): Map<string, EntityWrapper> =>
  registeredEntities;

type Props = {
  key: string,
};

type ConfigObj = {
  entityClass: any,
  children: any,
  props: Props,
};

export const register = (configObj: ConfigObj, context: ?Object): EntityWrapper => {
  const { entityClass, children, props } = configObj;

  const newProps: Props = { key: 'parent', ...props };

  if (registeredEntities.has(newProps.key)) {
    const wrappedEntity: EntityWrapper = registeredEntities.get(newProps.key);

    wrappedEntity.updateParams(newProps, children, context);
    wrappedEntity.update();

    return wrappedEntity;
  } else {
    const wrappedEntity: EntityWrapper = new EntityWrapper(
      entityClass,
      newProps,
      children
    );

    if (!registeredEntitiesLock.has(newProps.key)) {
      registeredEntitiesLock.add(newProps.key);

      wrappedEntity.mount(newProps, children, context);

      registeredEntities.set(newProps.key, wrappedEntity);
      registeredEntitiesLock.delete(newProps.key);
    }

    return wrappedEntity;
  }
};

export const deregister = (configObj: ConfigObj): boolean => {
  danger(
    configObj.props.hasOwnProperty('key'),
    'deregister: given entity does not have key prop'
  );

  const wrappedEntity: EntityWrapper = registeredEntities.get(
    configObj.props.key
  );

  wrappedEntity.remove();

  const deleted = registeredEntities.delete(configObj.props.key);

  return deleted;
};
