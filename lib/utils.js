
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

const strKeyMirror = module.exports.strKeyMirror = function(s, sep_) {
  const sep = sep_ || ',';

  return s.split(sep).reduce(function(m, key) {
    return {...m, [key]:key};
  }, {});
};

const safeJSONParse = module.exports.safeJSONParse = function(json) {
  var result;
  try {
    result = JSON.parse(json);
  } catch (error) {
  }

  return result;
};

