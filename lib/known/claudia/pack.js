
const _                       = require('underscore');

const {
  append,
  strKeyMirror,
  keyMirror
}                             = require('../../utils');
const stf                     = require('../../../');
// console.log({stf});

var lib = {};

const commandOptions = {
  // dryRun: true
};

const packCliArgs = 'output,force,source,no-optional-dependencies,use-local-dependencies,npm-options,post-package-script';

const spec = _.extend({}, strKeyMirror(packCliArgs));
const groc = stf.groc.std('claudia pack', spec);

lib.pack = stf.command('pack', commandOptions, groc, async function({stdout, stderr, ...rest}) {
  console.log('postRun:', {rest});
  return new Promise((resolve) => {
    return resolve(true);
  });
});

const pack = module.exports.pack = function(...args) {
  // console.log({args});
  return lib.pack(...args);
};

