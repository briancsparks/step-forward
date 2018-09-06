
const _                       = require('underscore');

const {
  append,
  strKeyMirror,
  keyMirror
}                             = require('../../utils');
const stf                     = require('../../../');
console.log({stf});

var lib = {};

const commandOptions = {
  dryRun: true
};

const setVersionCliArgs = 'version,source,config,update-env,set-env,update-env-from-json,set-env-from-json,env-kms-key-arn';

const spec = _.extend({}, strKeyMirror(setVersionCliArgs),
    // keyMirror('set-env,update-env', () =>               o    =>           _.reduce(o, (s,v,k) => { return append(s, `${k}=${v}`) }, '')      ),
    keyMirror('set-env,update-env', () => {return{out: (o,d) => `--${d} ${_.reduce(o, (s,v,k) => { return append(s, `${k}=${v}`) }, '')}`}}),
);
const groc = stf.groc.std('claudia set-version', spec);

lib.setVersion = stf.command('set-version', commandOptions, groc, async function({stdout, stderr, ...rest}) {
  console.log('rest:', {rest});
});

const setVersion = module.exports.setVersion = function(...args) {
  // console.log({args});
  return lib.setVersion(...args);
};

