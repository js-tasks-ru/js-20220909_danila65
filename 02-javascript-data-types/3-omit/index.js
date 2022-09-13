/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const newObj = { ...obj };

  Object.entries(newObj).forEach(([key, value]) => {
    const keyToDelete = fields.find((el) => el === key);

    if (keyToDelete) {
      delete newObj[keyToDelete];
    }
  });

  return newObj;
};
