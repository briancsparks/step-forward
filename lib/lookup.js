
const getFn = function(modname, fname) {
  try {
    const mod = require(`../lib/known/${modname}/${fname}`);
    if (mod) {
      return mod[fname];
    }
  } catch(error) {
  }

  try {
    const mod = require(`../lib/known/${modname}`);
    if (mod) {
      return mod[fname];
    }
  } catch(error) {
  }

};

const getFnArgv = function(modname, fname, argv) {
  var fn = getFn(modname, fname);
  if (fn) {
    return {fn, argv};
  }
};

const two = function(mod, name, ...rest) {
  if (!mod  || mod[0] === '-')  { return; }
  if (!name || name[0] === '-') { return; }

  const [ sub, ...nextRest ] = rest;
  return  two(`${mod}/${name}`, sub,  ...nextRest) ||
          getFnArgv(`${mod}/${name}`, name, rest) ||
          getFnArgv(mod, name, rest);
};

const one = function(name, ...rest) {

  const [ sub, ...nextRest ] = rest;
  return two(name, sub, ...nextRest) || getFnArgv(name, name, rest);
};

module.exports.lookup = function(...args) {
  const fn = one(...args);
  if (fn) {
    return fn.fn;
  }
};

