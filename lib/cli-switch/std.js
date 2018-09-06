
const {
  strKeyMirror,
  toDashCase,
  toCamelCase,
  toCapitalCase,
  toSnakeCase
}                             = require('../utils');

const grocOne = function(s, params, name) {
  const dashed  = toDashCase(name);
  var   value   = params[toSnakeCase(name)];
  var   value   = value || params[toCamelCase(name)] || params[toCapitalCase(name)] || params[toDashCase(name)];

  if (!value) {
    return s;
  }

  if (typeof value === 'string') {
    value = `'${value}'`;
  } else {
    value = value.map(function(s) {return `'${s}'`}).join(' ');
  }

  return `${s} --${dashed} ${value}`;
};

const grocer = module.exports.grocer = function(argv, params, name, spec_) {
  return new Promise(function(resolve, reject) {
    var   spec = spec_;

    if (typeof spec === 'string') {
      spec = strKeyMirror(spec);
    }

    const result = Object.keys(spec).reduce(function(s, key) {
      return grocOne(s, params, key);
    }, argv);

    return resolve({
      commandName:    name,
      args:           result
    });
    return resolve(result);
  });
};

const groc = module.exports.groc = function(a, b, c, d) {
  if (arguments.length === 4) {
    return grocer(a, b, c, d);
  }

  /* otherwise -- the caller wants a groc-making function */
  return function (argv, params) {
    return grocer(argv, params, a, b);
  };

  // return new Promise(function(resolve, reject) {
  // });
};
