
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
const Orchestrator            = require('orchestrator');

exports.Runner = function(...args) {
  var self = this;

  self.orc = new Orchestrator(...args);

  self.add = function(...args) {
    return orc.add(...args);
  };

  self.start = function(...args) {
    return orc.start(...args);
  };
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

exports.command = function(name, options_, buildParams, postRun) {
  const options1 = options_ || {};

  return async function(params) {

    // Any command can be skipped by its name
    if (params[name] === 0 || params[name] === false) {
      logit(`Skipping ${name}`);
      return Promise.resolve({skipped:name});
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

    rest.json = kv({}, 'stdout', safeJSONParse(stdout), 'stderr', safeJSONParse(stderr));

    // rest.json.stdout = safeJSONParse(stdout);
    // rest.json.stderr = safeJSONParse(stderr);

    if (postRun) {
      await postRun({stdout, stderr, ...rest});
    }

    logExec(`${name} done`, {stdout, stderr});
    return {stdout, stderr, ...rest};
  };
};

exports.parseArgs = function(name, options_, parseParams) {
  const options1 = options_ || {};

  return async function(args_) {
    const { commandName, args, options } = await parseParams({}, args_);
  };
};

exports.groc = {
  std:  require('./lib/cli-switch/std').groc,
};

exports.claudia = function() {
  const create      = lookup('claudia', 'create');
  const pack        = lookup('claudia', 'pack');
  const setVersion  = lookup('claudia', 'set-version');
  const update      = lookup('claudia', 'update');

  return { create, pack, setVersion, update };
};

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


