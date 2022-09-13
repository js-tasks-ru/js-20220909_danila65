/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (srcObj, ...fields) => {
  const newObj = {};

  fields.forEach((key, idx) => {
    if (srcObj[key]) {
      newObj[key] = srcObj[key];
    }
  });

  return newObj;
};
