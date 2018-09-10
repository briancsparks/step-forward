
const _                       = require('underscore');
const utilLib                 = require('util');
const {
  promisify,
  callbackify
}                             = utilLib;
const utils                   = require('./utils');
const minimist                = require('minimist');
const {
  caseParts,
  capitalizeFirstLetter,
  toDashCase,
  toSnakeCase,
  toCamelCase,
  toCapitalCase,
  append
}                             = utils;

exports._                     = _;

exports.promisify             = promisify;
exports.callbackify           = callbackify;

exports.caseParts             = caseParts;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.toDashCase            = toDashCase;
exports.toSnakeCase           = toSnakeCase;
exports.toCamelCase           = toCamelCase;
exports.toCapitalCase         = toCapitalCase;
exports.append                = append;


const jetpack                 = exports.jetpack = require('fs-jetpack');



const minimistify = exports.minimistify = function(argv) {
  var ar = minimist(argv);

  const keys = Object.keys(ar);
  keys.forEach(function(key) {
    let snake_cased = toSnakeCase(key);
    ar[snake_cased] = ar[key];

    ar[toDashCase(key)] = ar[toCamelCase(key)] = ar[toCapitalCase(key)] = ar[key];
  });

  return ar;
};



/**
 *  Returns `true` if the item is one of the things in JavaScript that cannot
 *  be manipulated (`null`, `undefined`, `NaN`).
 *
 * @param {*} x
 * @returns true or false
 */
const isnt = function(x) {
  return _.isUndefined(x) || _.isNull(x) || _.isNaN(x);
}
exports.isnt = isnt;

/**
 *  Returns true if the item is a valid item (that you can manipulate and use the value.)
 *
 * @param {*} x
 * @returns true or false
 */
exports.is = function(x) {
  return x || (x===0) || (x==='') || (x===false);
};
const is = exports.is;


/**
 *  Formats and colorizes objects for output (i.e. util.inspect)
 *
 * @param {*} x
 * @returns Formatted and colored object.
 */
exports.colored = function(x) {
  return utilLib.inspect(x, {depth:null, colors:true});
};
const colored = exports.colored;

const inspect = exports.inspect = function(x) {
  return utilLib.inspect(x, {depth:null});
};

exports.extract = function(obj, key) {
  const result = obj[key];

  if (key in obj) {
    delete obj[key];
  }

  return result;
};

/**
 *  Adds `v` to `o` at `k`, in an immutable way, and returns the object. Very
 *  useful in `reduce`.
 *
 *  Does nothing (returns original `o`) unless `k` is a string, and `v` is a
 *  valid value.
 *
 * @param {*} o
 * @param {*} k
 * @param {*} v
 * @param {*} rest
 * @returns
 */
exports.kv = function(o,k,v,...rest) {
  var result = {...o};
  if (typeof k === 'string' && is(v)) {
    result = {...result, [k]:v};
  }
  if (rest.length > 0) {
    result = kv(result, ...rest);
  }
  return result;
};
const kv = exports.kv;


/**
 *  A reducer for objects.
 *
 *  The parameters are reordered so the function is last.
 *
 *  `reducer` takes `(m, v, k)`
 *
 *  Return `[k, v]` to accumulate into the object.
 *
 * @param {*} obj
 * @param {*} initial
 * @param {*} reducer
 */
exports.reduce = function(obj, initial, reducer) {
  const keys = Object.keys(obj);
  const len  = keys.length;

  if (len === 0) {
    return initial;
  }

  const initialIsArray = _.isArray(initial);

  var   curr = initial;
  for (var i = 0; i < len; ++i) {
    let key     = keys[i];
    let value   = obj[key];

    let resp = reducer(curr, value, key, obj);

    if (_.isArray(resp)) {
      if (initialIsArray) {
        curr = [...curr, ...resp];
      } else {
        if (typeof resp[0] === 'string') {
          resp = [resp];
        }

        curr = resp.reduce((m, pair) => {
          let k = pair[0], v = pair[1] || k;
          return {...m, [k]: v};
        }, curr);
      }
    } else {
      curr = resp;
    }
  }

  return curr;
};
const reduce = exports.reduce;


const safeJSONParse = module.exports.safeJSONParse = function(json) {
  try {
    return JSON.parse(json);
  } catch(error){}
};

module.exports.jsonify = function(x) {
  if (typeof x !== 'string') {
    return x;
  }

  return safeJSONParse(x);
};






const PowerSquad = function(otherModule) {
  var   self      = this;

  self.utils      = {_, ...utilLib};

  otherModule.exports.async = otherModule.exports.async || {};

  self.xport = function(fobj) {
    var previousFn;

    _.each(fobj, (fn,k) => {
      otherModule.exports[k]        = previousFn = (fn || previousFn);
      otherModule.exports.async[k]  = promisify(fn || previousFn);
    });

    return previousFn;
  };

  self.async = function(fobj) {
    var previousFn;

    _.each(fobj, (fn,k) => {
      otherModule.exports.async[k]  = previousFn = (fn || previousFn);
      otherModule.exports[k]        = callbackify(fn || previousFn);
    });

    return previousFn;
  };

};

module.exports.powerSquad = function(...args) {
  return new PowerSquad(...args);
};

exports.setOn = function(obj, pathish, value) {
  if (!obj || isnt(value))            { return value; }
  if (typeof pathish === 'string')    { return exports.setOn(obj, pathish.split('.'), value); }
  if (_.any(pathish, x => isnt(x)))   { return value; }

  var   names = [...pathish];

  var curr = obj;
  while (names.length > 0) {
    let name = names.shift();
    curr = curr[name] = curr[name] || {};
  }

  const name = names[0];
  if (_.isArray(curr[name]) || _.isArray(value)) {
    curr[name] = [...(curr[name] || []), ...arrayify(value)];

  } else if (_.isObject(value) && value.merge) {
    curr[name] = {...(curr[name] || {}), ...value.merge};

  } else {
    curr[name] = value;
  }
};

function arrayify(x) {
  if (_.isArray(x))   { return x; }
  return [x];
}


exports.deref = function(obj, pathish) {
  if (!obj)                           { return; }
  if (typeof pathish === 'string')    { return exports.deref(obj, pathish.split('.')); }
  if (_.any(pathish, x => isnt(x)))   { return; }

  const len = pathish.length;
  var   i;

  var curr = obj;
  for (i = 0; i < len - 1; ++i) {
    curr = derefit(curr, pathish[i]);
  }

  return derefit(curr, pathish[i]);
};

function derefit(obj, key) {
  if (isnt(obj)) {
    return obj;
  }

  return obj[key];
}


/**
 *  Returns `process.env` with secrets and key removed.
 *
 *
 */
exports.cleanEnv = function() {

  return exports.reduce(process.env, {}, (m,v,k) => {
    const lkey = k.toLowerCase();
    var bad = false;

    bad = bad || lkey.indexOf('access_key') !== -1;
    bad = bad || lkey.indexOf('session_token') !== -1;
    bad = bad || lkey.indexOf('api_key') !== -1;

    if (bad)    { return m; }
    return {...m, [k]: v};
  });
};

