const { NODE_ENV } = process.env;

export default function danger(condition, errorMessage) {
  if (NODE_ENV !== 'production') {
    if (!condition) {
      throw new Error(errorMessage);
    }
  }
}
