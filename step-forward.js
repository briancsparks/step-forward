
const {
  promisify,
  inspect }                   = require('util');
const exec                    = promisify(require('child_process').exec);


exports.command = function(name, buildParams, postRun) {
  return async function(argv) {

    // Any command can be skipped by its name
    if (argv[name] === 0 || argv[name] === false) {
      logit(`Skipping ${name}`);
      return Promise.resolve({skipped:name});
    }

    // Get the command implementation to build the command-line
    const { commandName, args } = await buildParams(argv);

    const commandLine           = `${commandName} ${flattenArgs(args)}`;

    logit(`Task: ${name}\n  ${commandName}`);

    const { stdout, stderr, ...rest } = await exec(commandLine);

    if (postFn) {
      await postFn();
    }

    logExec(`${name} done`, {stdout, stderr});
    return {stdout, stderr, ...rest};
  };
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


