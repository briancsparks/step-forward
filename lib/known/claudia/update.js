
const _                       = require('underscore');

const {
  append,
  strKeyMirror,
  keyMirror
}                             = require('../../utils');
const stf                     = require('../../../');
// console.log({stf});

var gitRoot, cfDir;
var lib = {};

const commandOptions = {
  // dryRun: true
};

const updateCliArgs = 'version,source,config,timeout,runtime,memory,no-optional-dependencies,use-local-dependencies,'
                     +'npm-options,cache-api-config,post-package-script,keep,use-s3-bucket,s3-sse,update-env,set-env,'
                     +'update-env-from-json,set-env-from-json,env-kms-key-arn';
const others        = 'stage,conf-dir';

const spec = _.extend({}, strKeyMirror(updateCliArgs), strKeyMirror(others),
    keyMirror('set-env,update-env', () => {return{
      out: (o,d) => `--${d} ${_.reduce(o, (s,v,k) => { return append(s, `${k}=${v}`) }, '')}`,
      in_: (s,k) => _.reduce(s.split(','), (m,kv) => kv(m,...(kv.split('='))), {}),
    }})
);
const groc = stf.groc.std('claudia update', spec);



lib.parse = stf.parseArgs('update', commandOptions, groc);

const parse = module.exports.parse = function(...args) {
  // console.log(`parse`, {args});
  return lib.parse(...args);
};


commandOptions.defaultParams = async function(userParams) {
  var   params    = {...userParams};
  gitRoot         = gitRoot || await stf.gitRoot();
  cfDir           = cfDir   ||  params.conf_dir ? gitRoot.cwd(params.conf_dir) : gitRoot.cwd('config');

  const stage     = params.stage;

  params.region = params.region || 'us-east-1';

  // Must remove the items that are not ours
  const otherNames  = others.replace(/-/g, '_').split(',');
  const others_     = _.pick(params, ...otherNames);
  params            = _.omit(params, ...otherNames);

  return {params, others:others_};
};



lib.update = stf.command('update', commandOptions, groc, async function({stdout, stderr, ...rest}, params, others) {
  console.log('postRun:', {rest, params, others});

  return new Promise((resolve) => {
    return resolve(true);
  });
});

const update = module.exports.update = function(...args) {
  // console.log({args});
  return lib.update(...args);
};

