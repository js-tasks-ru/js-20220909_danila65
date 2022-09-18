/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
 
  const splittedArgs = path.split('.');

  return (srcObject) => {
    let res;

    splittedArgs.forEach((arg, idx) => {
      if (idx === 0) {
        res = srcObject[arg];
        return;
      }

      // if (Object.hasOwn(res, arg)) {
      //   res = res[arg];
      // }
      res = res?.[arg];
      
    });

    return res;
  };
}
