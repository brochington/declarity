/* @flow */
import danger from './danger';
import EntityWrapper from './EntityWrapper';

let entityKeys = new Map();

type Props = {
  key: string,
};

type ConfigObj = {
  entityClass: any,
  children: any,
  props: Props,
};

export const register = (configObj: ConfigObj, context: ?Object): void => {
  const { entityClass, children, props } = configObj;

  const newProps: Props = { key: 'parent', ...props };

  if (entityKeys.has(newProps.key)) {
    const wrappedEntity: EntityWrapper = entityKeys.get(newProps.key);
    wrappedEntity.updateParams(newProps, children, context);
    wrappedEntity.update();
  } else {
    const wrappedEntity: EntityWrapper = new EntityWrapper(
      entityClass,
      newProps,
      children
    );
    wrappedEntity.mount(newProps, children, context);

    entityKeys.set(newProps.key, wrappedEntity);
  }

  // might want to return something here so that the mounted component can be dismounted later.
};

export const deregister = (configObj: ConfigObj) => {
  danger(
    configObj.props.hasOwnProperty('key'),
    'deregister: given entity does not have key prop'
  );

  entityKeys.delete(configObj.props.key);
};
