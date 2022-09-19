/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return '';
  }
  if (size === undefined) {
    return string;
  }

  const res = [];

  let repeatedCount = 0;

  string.split('').forEach((sym, idx) => {
    if (sym === string[idx + 1]) {
      repeatedCount++;

      if (size >= repeatedCount + 1) {
        res.push(sym);
      }
    } else {
      repeatedCount = 0;
      res.push(sym);
    }
  });

  return res.join('');
}
