#!/usr/bin/env node

const path                    = require('path');

// const argv = require('minimist')(process.argv.slice(2));
const argv = require('minimist')('claudia create --subnet-ids subnet-c0cf7088,subnet-5bb24a01,subnet-045f9c28,subnet-04386838 --scurity-group-ids sg-4b9ff335,sg-539cf02d --version dev --region us-east-1 --handler lambda.handler --deploy-proxy-api --use-s3-bucket netlab-dev'.split(' '));

// console.log({argv});

const getFn = function(modname, fname) {
  try {
    // const mod = require(path.join('..', 'lib', 'known', modname, fname));
    const mod = require(`../lib/known/${modname}/${fname}`);
    if (mod) {
      return {fn:mod[fname], parse:mod.parse};
      // return mod[fname];
    }
  } catch(error) {
  }

  try {
    // const mod = require(path.join('..', 'lib', 'known', ...modname.split('/')));
    const mod = require(`../lib/known/${modname}`);
    if (mod) {
      return {fn:mod[fname], parse:mod.parse};
      // return mod[fname];
    }
  } catch(error) {
  }

};

const getFnArgv = function(modname, fname, argv) {
  var fn = getFn(modname, fname);
  if (fn) {
    return {...fn, argv};
    // return {fn, argv};
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
  return two(name, sub, ...nextRest) || findFn();

  function findFn() {
    var fn;
    if ((fn = getFn(name, name))) {
      return {...fn, argv: rest};
      // return {fn, argv: rest};
    }
  }
};

const runIt = async function(...args) {
  const fn = one(...args);
  if (fn) {
    // console.log({fn});

    // const argv = require('minimist')(fn.argv);
    // fn.fn(argv);

    const argv = fn.parse ? await fn.parse(fn.argv) : fn.argv;
    // console.log(`parsed: `, {argv, fnargv:fn.argv});
    fn.fn(argv);
  }
};

// runIt('claudia', 'create', '--arg_one');
const args = process.argv.slice(2);
// const args = ['claudia', 'create', '--arg_one'];
// const args = 'claudia create --subnet-ids subnet-c0cf7088,subnet-5bb24a01,subnet-045f9c28,subnet-04386838 --scurity-group-ids sg-4b9ff335,sg-539cf02d --version dev --region us-east-1 --handler lambda.handler --deploy-proxy-api --use-s3-bucket netlab-dev'.split(' ');
runIt(...args);
