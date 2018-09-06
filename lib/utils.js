
const os                      = require('os');

const isWindows = os.type().toLowerCase().startsWith('win');

var quoted = function(s) {
  return `'${s}'`;
};

if (isWindows) {
  quoted = function(s) {
    return `"${s}"`;
  };
}
module.exports.quoted = quoted;

const is = module.exports.is = function(x) {
  return x || (x===0) || (x==='') || (x===false);
};

const isnt = module.exports.isnt = function(x) {
  return !is(x);
};

const kv = module.exports.kv = function(o,k,v,...rest) {
  var result = {...o};
  if (typeof k === 'string' && is(v)) {
    result = {...result, [k]:v};
  }
  if (rest.length > 0) {
    result = kv(result, ...rest);
  }
  return result;
};

const capitalizeFirstLetter = module.exports.capitalizeFirstLetter = function(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const caseParts = module.exports.caseParts = function(key) {
  return key.split(/[._-]+/g);
};

const toDashCase = module.exports.toDashCase = function(key) {
  return caseParts(key).join('-');
};

const toSnakeCase = module.exports.toSnakeCase = function(key) {
  const parts   = caseParts(key);
  const result  = parts.join('_');
  return result;
};

const toCamelCase = module.exports.toCamelCase = function(key) {
  var   parts   = caseParts(key);
  var   result  = parts.shift();

  return parts.reduce(function(m, s) {
    return m + capitalizeFirstLetter(s);
  }, result);
};

const toCapitalCase = module.exports.toCapitalCase = function(key) {
  return capitalizeFirstLetter(toCamelCase(key));
};

const append = module.exports.append = function(s, v) {
  if (s) {
    return s + ','+v;
  }
  return s + v;
};

const identity = function(x) {
  return x;
};

const keyMirrorResolver = function(valueish, key) {
  if (typeof valueish === 'function') {
    return valueish(key);
  }

  if (Array.isArray(valuish)) {
    return [...valueish, key];
  }

  if (typeof valuish === 'object') {
    return valuish[key];
  }

  return valuish;
};

const keyMirror = module.exports.keyMirror = function(s, valueish_, sep_) {
  const valueish  = valueish_ || identity;
  const sep       = sep_      || ',';

  return s.split(sep).reduce(function(m, key) {
    return {...m, [key]:keyMirrorResolver(valueish, key)};
  }, {});
};

const strKeyMirror = module.exports.strKeyMirror = function(s, sep_) {
  return keyMirror(s, null, sep_);
};

const safeJSONParse = module.exports.safeJSONParse = function(json) {
  var result;
  try {
    result = JSON.parse(json);
  } catch (error) {
  }

  return result;
};

