#!/usr/bin/env node

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

  // function findFn() {
  //   var fn;
  //   if ((fn = getFn(mod, name))) {
  //     return {fn, argv: rest};
  //   }
  // };
};

const one = function(name, ...rest) {

  const [ sub, ...nextRest ] = rest;
  return two(name, sub, ...nextRest) || findFn();

  function findFn() {
    var fn;
    if ((fn = getFn(name, name))) {
      return {fn, argv: rest};
    }
  }
};

// const one = function(a, ...b) {
//   console.log(`trying: ${a}::${b}`);

//   var mod;
//   if (!(mod = require(a))) {
//     const subcmd = b[0];
//     if (!subcmd) {
//       console.error(`Cannot find how to execute: ${process.argv.join(' ')}`);
//       return;
//     }

//     return one(`${a} ${subcmd}`, b.slice(1));
//   }

//   console.log(`Found mod: ${a}, trying...`);
// };

const runIt = function(...args) {
  const fn = one(...args);
  if (fn) {
    fn.fn(...fn.argv);
  }
};

runIt('claudia', 'create', '--arg_one');
// runIt(process.argv.slice(2));
