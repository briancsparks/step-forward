
const _                       = require('underscore');

const {
  kv,
  quoted,
  append,
  strKeyMirror,
  keyMirror
}                             = require('../../utils');
const stf                     = require('../../../');
// console.log({stf});

var lib = {};

var   commandOptions = {
  // dryRun: true
};

const createCliArgs = 'region,handler,api-module,deploy-proxy-api,name,version,source,config,policies,allow-recursion,role,'
               +'runtime,description,memory,timeout,no-optional-dependencies,use-local-dependencies,npm-options,'
               +'cache-api-config,post-package-script,keep,use-s3-bucket,s3-sse,aws-delay,aws-retries,subnet-ids,security-group-ids,'
               +'set-env,set-env-from-json,env-kms-key-arn'
               ;
const others  = 'stage';

const spec = _.extend({}, strKeyMirror(createCliArgs), strKeyMirror(others),
    // keyMirror('security-group-ids,subnet-ids', () => {return{
    //   out: (arr,d) => `--${d} ${quoted(arr.join(','))}`
    // }}),              /* [a,b,c] ==> 'a,b,c' */

    // [a,b,c] ==> 'a,b,c'
    keyMirror('subnet-ids,security-group-ids', () => {return{
      // out: (arr,d) => `--${d} ${quoted(arr.join(','))}`
      out: (arr,d) => `--${d} ${quoted(arr)}`,
      in_: (arr,k) => kv({},k,arr.split(',')),
    }}),

    keyMirror('set-env', () => {return{
      out: (o,d) => `--${d} ${_.reduce(o, (s,v,k) => { return append(s, `${k}=${v}`) }, '')}`,
      in_: (s,k) => _.reduce(s.split(','), (m,kv) => kv(m,...(kv.split('='))), {}),
    }}),

    keyMirror('deploy-proxy-api', () => {return{
      out: (v,d) => `--${d}`,
      in_: (s,k) => kv({}, k, k),
    }}),
);
const groc = stf.groc.std('claudia create', spec);

lib.parse = stf.parseArgs('create', commandOptions, groc);

const parse = module.exports.parse = function(...args) {
  // console.log(`parse`, {args});
  return lib.parse(...args);
};

commandOptions.defaultParams = async function(userParams) {
  var   params    = {...userParams};
  const stage     = params.stage;
  const gitRoot   = await stf.gitRoot();
  const cfDir     = gitRoot.cwd('config');

  params.region = params.region || 'us-east-1';

  if (params.handler) {
    params.deploy_proxy_api = ('deploy_proxy_api' in params ? params.deploy_proxy_api : true);
  }

  if (stage) {
    params.version = params.version || stage;

    if (!params.config) {
      let name = `claudia-${stage}.json`;
      await cfDir.fileAsync(name, {content: {}});
      params.config  = cfDir.path(name);
    }

  }

  // Must remove the items that are not ours
  return _.omit(params, ...others.split(','));
};

lib.create = stf.command('create', commandOptions, groc, async function({stdout, stderr, ...rest}) {
  console.log('postRun:', {rest});
  return new Promise((resolve) => {
    return resolve(true);
  });
});

const create = module.exports.create = function(...args) {
  // console.log({args});
  return lib.create(...args);
};

// if (process.argv[1] === __filename) {
//   const args = {
//     api_module: 'the api module',
//     subnet_ids: ['subnet-1', 'subnet-2'],
//   };

//   console.log('groc: ', groc('', args));

//   create(args);
// }
