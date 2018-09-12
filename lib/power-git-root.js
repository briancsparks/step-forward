
const jetpack                 = require('fs-jetpack');

var root;
exports.gitRoot = function() {
  if (root)   { return root; }

  const execSync = require('child_process').execSync;

  const execResult = execSync(`git rev-parse show-toplevel`, {
    cwd:          process.cwd(),
    windowsHide:  true
  });

  return root = jetpack.cwd(execResult.stdout.split('\n')[0]);
};
