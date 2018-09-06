
const {
  promisify,
  inspect }                   = require('util');
const exec                    = promisify(require('child_process').exec);


exports.command = function(name, buildParams, postRun) {
  return async function(params) {

    // Any command can be skipped by its name
    if (params[name] === 0 || params[name] === false) {
      logit(`Skipping ${name}`);
      return Promise.resolve({skipped:name});
    }

    // Get the command implementation to build the command-line
    const { commandName, args } = await buildParams('', params);

    const commandLine           = `${commandName} ${flattenArgs(args)}`;

    logit(`Task: ${name}\n  ${commandLine}`);

    var   execResult;
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

    var { stdout, stderr, ...rest } = execResult;
    rest.json = {};

    rest.json.stdout = safeJSONParse(stdout);
    rest.json.stderr = safeJSONParse(stderr);

    if (postRun) {
      await postRun({stdout, stderr, ...rest});
    }

    logExec(`${name} done`, {stdout, stderr});
    return {stdout, stderr, ...rest};
  };
};

exports.groc = {
  std:  require('./lib/cli-switch/std').groc,
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


