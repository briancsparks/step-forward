
const {
  quoted,
  strKeyMirror,
  toDashCase,
  toCamelCase,
  toCapitalCase,
  toSnakeCase
}                             = require('../utils');

const resolveValue = function(spec_, value, key, dashed_, out) {
  var spec = spec_;
  // if (typeof spec_ === 'string') {
  //   spec = spec_;
  // } else if (out) {
  //   spec = spec_.out;
  // } else {
  //   spec = spec.in;
  // }

  if (typeof spec.out === 'function') {
    return spec.out(value, dashed_, key);
  }

  if (spec === key) {
    if (Array.isArray(value)) {
      return dashed(value.map(v => quoted(v)).join(' '));
    }
    return dashed(quoted(value));
  }

  if (Array.isArray(spec)) {
    return dashed([...spec, value]);
  }

  if (typeof spec === 'object') {
    return dashed(quoted(spec[value]));
  }

  if (typeof spec === 'boolean') {
    return spec ? 'true' : 'false';
  }

  if (typeof spec === 'number') {
    return dashed(''+spec);
  }

  return dashed(quoted(spec || value));

  function dashed(x) {
    return `--${dashed_} ${x}`;
  }
};

const resolveArg = function(dashed, spec, value, key) {
  return `${resolveValue(spec, value, key, dashed)}`;
};

const grocOne = function(s, params, key, spec) {
  const dashed  = toDashCase(key);
  var   value   = params[toSnakeCase(key)];
  var   value   = value || params[toCamelCase(key)] || params[toCapitalCase(key)] || params[toDashCase(key)];

  if (!value) {
    return s;
  }

  return `${s} ${resolveArg(dashed, spec, value, key)}`;
};

const grocer = module.exports.grocer = function(argv, params, name, spec_) {
  return new Promise(function(resolve, reject) {
    var   spec = spec_;

    if (typeof spec === 'string') {
      spec = strKeyMirror(spec);
    }

    const result = Object.keys(spec).reduce(function(s, key) {
      return grocOne(s, params, key, spec[key]);
    }, argv);

    return resolve({
      commandName:    name,
      args:           result
    });
    // return resolve(result);
  });
};

const groc = module.exports.groc = function(a, b, c, d) {
  if (arguments.length === 4) {
    return grocer(a, b, c, d);
  }

  /* otherwise -- the caller wants a groc-making function */
  return async function (argv, params) {
    return await grocer(argv, params, a, b);
  };

  // return new Promise(function(resolve, reject) {
  // });
};
