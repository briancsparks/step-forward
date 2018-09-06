
const _                       = require('underscore');

const {
  kv,
  quoted,
  append,
  strKeyMirror,
  keyMirror
}                             = require('../../utils');
const stf                     = require('../../../');

var lib = {};

const commandOptions = {
  // dryRun: true
};

const destroyCliArgs = 'source,config';

const spec = _.extend({}, strKeyMirror(destroyCliArgs));
const groc = stf.groc.std('claudia destroy', spec);

lib.parse = stf.parseArgs('destroy', commandOptions, groc);

const parse = module.exports.parse = function(...args) {
  return lib.parse(...args);
};

lib.destroy = stf.command('destroy', commandOptions, groc, async function({stdout, stderr, ...rest}) {
  console.log('postRun:', {rest});
  return new Promise((resolve) => {
    return resolve(true);
  });
});

const destroy = module.exports.destroy = function(...args) {
  // console.log({args});
  return lib.destroy(...args);
};
