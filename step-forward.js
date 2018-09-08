
const _                       = require('underscore');
const {
  promisify,
  inspect }                   = require('util');
const {
  kv,
  safeJSONParse
}                             = require('./lib/utils');
const exec                    = promisify(require('child_process').exec);
const {
  lookup
}                             = require('./lib/lookup');
const jetpack                 = require('fs-jetpack');
const Orchestrator            = require('orchestrator');


var lib = {};

exports.Runner = function(...args) {
  var self = this;

  self.orc = new Orchestrator(...args);

  self.add = function(...args) {
    return self.orc.add(...args);
  };

  self.start = function(...args) {
    return self.orc.start(...args);
  };

  /**
   *  Orchastrator has finished. Log it.
   */
  self.reportDone = function(resolve, reject, err, result) {
    if (err && !err.missingTask)      { console.error(err); return reject(err); }

    if (err && err.missingTask) {
      result = {...result, missingTask: err.missingTask, taskList: err.taskList};
    }

    return resolve(result);
  }
};

exports.Runner.run = function(main) {

  const runner = async function() {
    return await main();
  };

  runner().then((result) => {
  })
  .catch((err) => {
  });
};

exports.command = function(name, options_, buildParams_, postRun_) {
  if (arguments.length >= 3) {
    return exports.command(name, kv({...options_}, 'options1', options_, 'buildParams', buildParams_, 'postRun', postRun_));
  }

  const {
    options1,
    defaultParams,
    buildParams,
    postRun }             = options_ || {};

  // const options1 = options_ || {};

  return async function(params_) {
    var   params = params_, others = {};
    if (Array.isArray(params)) {
      params = require('minimist')(params);
    }

    // Any command can be skipped by its name
    if (params[name] === 0 || params[name] === false) {
      logit(`Skipping ${name}`);
      return Promise.resolve({skipped:name});
    }

    if (defaultParams) {
      const defs = await defaultParams(params);
      params = defs.params;
      others = defs.others;
    }

    // Get the command implementation to build the command-line
    const { commandName, args, options } = await buildParams('', params);

    const options2              = _.extend({}, options1, options);
    const commandLine           = `${commandName} ${flattenArgs(args)}`;

    logit(`Task: ${name}\n  ${commandLine}`);

    var   execResult;
    if (options2.dry_run || options2.dryRun) {
      execResult = {stdout:'', stderr:''};
    } else {
      // var   { stdout, stderr, rest } = {};
      try {
        execResult = await exec(commandLine);
      } catch(error) {
        if (error.message) {
          console.error(error.message);
        }
        // console.error(error);

        throw error;
      }
    }

    var { stdout, stderr, ...rest } = execResult;
    // rest.json = {};

    rest.json = kv({}, 'stdout', safeJSONParse(stdout) || {just:stdout.split('\n')}, 'stderr', safeJSONParse(stderr));

    // rest.json.stdout = safeJSONParse(stdout);
    // rest.json.stderr = safeJSONParse(stderr);

    if (postRun) {
      await postRun({stdout, stderr, ...rest}, params, others);
    }

    logExec(`${name} done`, {stdout, stderr});
    return {stdout, stderr, ...rest};
  };
};

exports.parseArgs = function(name, options_, parseParams) {
  const options1 = options_ || {};

  return async function(args_) {
    const args = require('minimist')(args_);
    const { result } = await parseParams({}, args, true);
    return result;
  };
};

exports.groc = {
  std:  require('./lib/cli-switch/std').groc,
};

exports.fns = {};

exports.fns.git = {};

exports.git = function() {
  const rev_parse       = exports.fns.git.rev_parse = lookup('git', 'rev-parse').fn;

  return {
    rev_parse
  };
};

var foundGitRoot;
lib.gitRoot = exports.gitRoot = async function() {
  if (foundGitRoot) {
    return foundGitRoot;
  }

  const rev_parse =  exports.fns.git.rev_parse || (exports.git().rev_parse);
  const root = await rev_parse({show_toplevel:true});
  foundGitRoot = jetpack.cwd(root.json.stdout.just[0]);

  return foundGitRoot;
}


exports.claudia = function() {
  const create      = lookup('claudia', 'create').fn;
  const pack        = lookup('claudia', 'pack').fn;
  const setVersion  = lookup('claudia', 'set-version').fn;
  const update      = lookup('claudia', 'update').fn;

  return { create, pack, setVersion, update };
};

// lib.gitRoot().then(result => {
//   console.log(result);
// });

function logit(...args) {
  console.log(...args.reduce(function(m0, arg) {

    if (typeof arg === 'string')          { return [...m0, arg]; }
    if (typeof arg === 'undefined')       { return [...m0, arg]; }
    if (arg.noinspect)                    { return [...m0, arg.noinspect]; }

    return Object.keys(arg).reduce(function(m, key) {
      var   value = arg[key];

      if (value === null || typeof value === 'undefined') {
        return [...m, `{[${key}]: __undefined__}`];
      }

      if (value.noinspect) {
        return [...m, {[key]: value}];
      }

      if (key === 'stdout' || key === 'stderr') {
        //return [...m, {[key]: inspect(value)}];
        return [...m, {[key]: value}];
      }

      return [...m, inspectit({[key]: value})];
    }, m0);
  }, []));
}
exports.logit = logit;

function logExec(message, {stdout, stderr, error}) {
  const subBanner = `---------------------------------------------------\n--- ${message}`;

  if ((stdout && stdout.length) || (stderr && stderr.length)) {
    let   banner = subBanner + (stdout ? ', stdout:' : ', stderr:');
    console.log(banner);
  }

  if (stdout && stdout.length) {
    //console.log(stdout.split('\r').join('\n') /*.split('\n') */);
    console.log(_.last(stdout.split('\r')));

  } else if (stderr && stderr.length) {
    console.log(stderr.split('\r').join('\n') /*.split('\n') */);

  } else {
    console.log(message);
  }
}

function inspectit(x) {
  return inspect(x, {depth:null, colors:true});
}

function plain(x) {
  return { noinspect: x };
}

function flattenArgs(args) {
  if (typeof args === 'string') {
    return args;
  }

  return args.join(' ');
}


