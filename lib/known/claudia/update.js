
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

const updateCliArgs = 'version,source,config,timeout,runtime,memory,no-optional-dependencies,use-local-dependencies,'
                     +'npm-options,cache-api-config,post-package-script,keep,use-s3-bucket,s3-sse,update-env,set-env,'
                     +'update-env-from-json,set-env-from-json,env-kms-key-arn';

const spec = _.extend({}, strKeyMirror(updateCliArgs),
    // keyMirror('set-env,update-env', () =>               o =>              _.reduce(o, (s,v,k) => { return append(s, `${k}=${v}`) }, '')    ),
    keyMirror('set-env,update-env', () => {return{
      out: (o,d) => `--${d} ${_.reduce(o, (s,v,k) => { return append(s, `${k}=${v}`) }, '')}`,
      in_: (s,k) => _.reduce(s.split(','), (m,kv) => kv(m,...(kv.split('='))), {}),
    }}),
);
const groc = stf.groc.std('claudia update', spec);

lib.update = stf.command('update', commandOptions, groc, async function({stdout, stderr, ...rest}) {
  console.log('postRun:', {rest, params, others});
  return new Promise((resolve) => {
    return resolve(true);
  });
});

const update = module.exports.update = function(...args) {
  // console.log({args});
  return lib.update(...args);
};

