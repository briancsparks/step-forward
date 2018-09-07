
const _                       = require('underscore');

const {
  kv,
  strKeyMirror,
  keyMirror
}                             = require('../../utils');
const stf                     = require('../../../');
// console.log({stf});

var lib = {};

const commandOptions = {
  // dryRun: true
};

const cliArgs = 'show-toplevel';

const spec = _.extend({}, strKeyMirror(cliArgs),
  keyMirror('show-toplevel', () => {return{
    out: (v,d) => `--${d}`,
    in_: (s,k) => kv({}, k, k),
  }}),
);
const groc = stf.groc.std('git rev-parse', spec);

lib['rev-parse'] = lib.rev_parse = stf.command('rev-parse', commandOptions, groc, async function({stdout, stderr, ...rest}) {
  console.log('postRun:', {rest});
  return new Promise((resolve) => {
    return resolve(true);
  });
});

module.exports['rev-parse'] = module.exports.rev_parse = function(...args) {
  // console.log({args});
  return lib.rev_parse(...args);
};

