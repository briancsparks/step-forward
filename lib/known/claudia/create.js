
const _                       = require('underscore');

const {
  kv,
  quoted,
  append,
  strKeyMirror,
  keyMirror
}                             = require('../../utils');
const stf                     = require('../../../');

var gitRoot, cfDir;
// console.log({stf});

var defaultEnv_json = {
  db:     '10.0.0.2',
  redis:  '10.0.0.5'
};

var lib = {};

var   commandOptions = {
  // dryRun: true
};

const createCliArgs = 'region,handler,api-module,deploy-proxy-api,name,version,source,config,policies,allow-recursion,role,'
               +'runtime,description,memory,timeout,no-optional-dependencies,use-local-dependencies,npm-options,'
               +'cache-api-config,post-package-script,keep,use-s3-bucket,s3-sse,aws-delay,aws-retries,subnet-ids,security-group-ids,'
               +'set-env,set-env-from-json,env-kms-key-arn'
               ;
const others  = 'stage,conf-dir,proxy-handler';

const spec = _.extend({}, strKeyMirror(createCliArgs), strKeyMirror(others),
    // keyMirror('security-group-ids,subnet-ids', () => {return{
    //   out: (arr,d) => `--${d} ${quoted(arr.join(','))}`
    // }}),              /* [a,b,c] ==> 'a,b,c' */

    // [a,b,c] ==> 'a,b,c'
    keyMirror('subnet-ids,security-group-ids', () => {return{
      // out: (arr,d) => `--${d} ${quoted(arr)}`,
      out: (arr,d) => `--${d} ${quoted(arr.join(','))}`,
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
  gitRoot         = gitRoot || await stf.gitRoot();
  cfDir           = cfDir   ||  params.conf_dir ? gitRoot.cwd(params.conf_dir) : gitRoot.cwd('config');

  const stage     = params.stage;

  params.region = params.region || 'us-east-1';

  if (params.proxy_handler) {
    params.handler          = params.handler || params.proxy_handler;
    params.deploy_proxy_api = ('deploy_proxy_api' in params ? params.deploy_proxy_api : true);
  }

  if (stage) {
    params.version = params.version || stage;

    if (!params.config) {
      let name = `claudia-${stage}.json`;
      params.config  = cfDir.path(name);
    }

    if (!params.set_env_from_json) {
      let envname = `${stage}-env.json`;
      await cfDir.fileAsync(envname, {content: defaultEnv_json});
      params.set_env_from_json  = cfDir.path(envname);
    }

  }

  // Must remove the items that are not ours
  const otherNames  = others.replace(/-/g, '_').split(',');
  const others_     = _.pick(params, ...otherNames);
  params            = _.omit(params, ...otherNames);

  return {params, others:others_};
};

lib.create = stf.command('create', commandOptions, groc, async function({stdout, stderr, ...rest}, params, others) {
  console.log('postRun:', {rest, params, others});
  const stage     = others.stage;
  let confname    = `config.json`;

  // gitRoot         = await stf.gitRoot();
  // cfDir           = gitRoot.cwd('config');

  var   configuration = {
    params:     _.extend({}, params, others)
  };

  await cfDir.fileAsync(confname, {content: configuration});

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
