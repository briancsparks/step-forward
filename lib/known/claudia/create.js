
const _                       = require('underscore');

const {
  quoted,
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

const createCliArgs = 'region,handler,api-module,deploy-proxy-api,name,version,source,config,policies,allow-recursion,role,'
               +'runtime,description,memory,timeout,no-optional-dependencies,use-local-dependencies,npm-options,'
               +'cache-api-config,post-package-script,keep,use-s3-bucket,s3-sse,aws-delay,aws-retries,security-group-ids,subnet-ids,'
               +'set-env,set-env-from-json,env-kms-key-arn';

const spec = _.extend({}, strKeyMirror(createCliArgs),
    keyMirror('security-group-ids,subnet-ids', () => {return{out: (arr,d) => `--${d} ${quoted(arr)}`}}),              /* [a,b,c] ==> 'a,b,c' */
    // keyMirror('security-group-ids,subnet-ids', () => {return{out: (arr,d) => `--${d} ${quoted(arr.join(','))}`}}),              /* [a,b,c] ==> 'a,b,c' */
    keyMirror('set-env', () => {return{out: (o,d) => `--${d} ${_.reduce(o, (s,v,k) => { return append(s, `${k}=${v}`) }, '')}`}}),
    keyMirror('deploy-proxy-api', () => {return{out: (v,d) => `--${d}`}}),
);
const groc = stf.groc.std('claudia create', spec);

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
