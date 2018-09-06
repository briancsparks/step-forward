
const {
  strKeyMirror
}                             = require('../../utils');
const stf                     = require('../../../');
console.log({stf});

var lib = {};

// const createCliArgs = 'region,handler,api-module,deploy-proxy-api,name,version,source,config,policies,allow-recursion,role'
//                +'runtime,description,memory,timeout,no-optional-dependencies,use-local-dependencies,npm-options'
//                +'cache-api-config,post-package-script,keep,use-s3-bucket,s3-sse,aws-delay,aws-retries,security-group-ids,subnet-ids'
//                +'set-env,set-env-from-json,env-kms-key-arn';

const createCliArgs = 'api-module,subnet-ids';

const groc = stf.groc.std('claudia create', createCliArgs);

lib.create = stf.command('create', groc, async function({stdout, stderr, ...rest}) {
  console.log('rest:', {rest});
});

const create = module.exports.create = function(...args) {
  console.log({args});
  // return lib.create(...args);
};

// if (process.argv[1] === __filename) {
//   const args = {
//     api_module: 'the api module',
//     subnet_ids: ['subnet-1', 'subnet-2'],
//   };

//   console.log('groc: ', groc('', args));

//   create(args);
// }
