/* Classes */
import importEntity from './Entity';

/* functions */
import { register, deregister } from './registration';
import { createEntity } from './createEntity';

export default {
  Entity: importEntity,
  register,
  deregister,
  createEntity,
};
