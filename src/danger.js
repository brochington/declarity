/* @flow */
const { NODE_ENV } = process.env;

/**
* danger
* condition: It is expected that this condition is normally truthy.
*/
export default function danger(condition: boolean, errorMessage: string): void {
  if (NODE_ENV !== 'production') {
    if (!condition) {
      throw new Error(errorMessage);
    }
  }
}
