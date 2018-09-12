
const minimist                = require('minimist');


const minimistify = exports.minimistify = function(argv) {
  var ar = minimist(argv);

  const keys = Object.keys(ar);
  keys.forEach(function(key) {
    ar[toSnakeCase(key)]    = ar[toSnakeCase(key)]    || ar[key];
    ar[toDashCase(key)]     = ar[toDashCase(key)]     || ar[key];
    ar[toCamelCase(key)]    = ar[toCamelCase(key)]    || ar[key];
    ar[toCapitalCase(key)]  = ar[toCapitalCase(key)]  || ar[key];
  });

  return ar;
};

