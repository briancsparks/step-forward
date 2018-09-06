
const {
  quoted,
  strKeyMirror,
  toDashCase,
  toCamelCase,
  toCapitalCase,
  toSnakeCase
}                             = require('../utils');

const resolveArg = function(spec_, value, key, dashed_, in_) {
  var spec = spec_;
  if (typeof spec_ === 'string') {
    spec = spec_;
  } else if (in_) {
    spec = spec_.in_;
  } else {
    spec = spec_.out;
  }

  if (typeof spec === 'function') {
    return spec(value, dashed_, key);
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

// const resolveArg = function(dashed, spec, value, key) {
//   return `${resolveValue(spec, value, key, dashed)}`;
// };

const grocOne = function(s, params, key, spec, in_) {
  const dashed  = toDashCase(key);
  var   value   = params[toSnakeCase(key)];
  var   value   = value || params[toCamelCase(key)] || params[toCapitalCase(key)] || params[toDashCase(key)];

  if (!value) {
    return s;
  }

  return `${s} ${resolveArg(spec, value, key, dashed, in_)}`;
};

const grocer = module.exports.grocer = function(argv, params, name, spec_, in_) {
  return new Promise(function(resolve, reject) {
    var   spec = spec_;

    if (typeof spec === 'string') {
      spec = strKeyMirror(spec);
    }

    const result = Object.keys(spec).reduce(function(s, key) {
      return grocOne(s, params, key, spec[key], in_);
    }, argv);

    return resolve({
      commandName:    name,
      args:           result
    });
    // return resolve(result);
  });
};

const groc = module.exports.groc = function(a, b, c, d, in_) {
  if (arguments.length === 4) {
    return grocer(a, b, c, d, in_);
  }

  /* otherwise -- the caller wants a groc-making function */
  return async function (argv, params, in_) {
    return await grocer(argv, params, a, b, in_);
  };

  // return new Promise(function(resolve, reject) {
  // });
};
