/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const basicSortedItems = sortFuncWithOrder(arr, param);

  const reducedItems = basicSortedItems.reduce((acc, current) => {
    const loweredCaseCurrent = current.toLowerCase();

    if (!acc[loweredCaseCurrent]) {
      acc[loweredCaseCurrent] = [current];
      return acc;
    }

    acc[loweredCaseCurrent].push(current);
    return acc;
  }, {});

  const result = Object.keys(reducedItems)
    .map((key) =>
      sortFuncWithOrder(reducedItems[key], param === "asc" ? "desc" : "asc")
    )
    .flat();

  return result;

  function sortFuncWithOrder(arr, order) {
    const copyArr = [...arr];

    if (order === "asc") {
      return copyArr.sort((a, b) => {
        return a.localeCompare(b);
      });
    }

    return copyArr.sort((a, b) => {
      return b.localeCompare(a);
    });
  }
}
