

// const jetpack                 = require('fs-jetpack');

const stf                     = require('step-forward');
const {
  update
}                             = stf.claudia();
const claudiaUpdate           = update;
const {
  kv
}                             = require('../src/utils');

// console.log({stf, update});



const argv = require('minimist')(process.argv.slice(2));

const stage = 'dev';

// ---- Must run inside a function to be async ---- boilerplate start
stf.Runner.run(function() {
  return new Promise((resolve, reject) => {

    // Get a runner
    var runner = new stf.Runner();
    // ---- Must run inside a function to be async ---- boilerplate end

    // Get the project root according to .git (PRJ) (and PRJ/config, PRJ/config/dev-config.json, etc.)
    var gitRoot, confDir, config, cconfig;

    // Get those config files in one step. If you had to use an HTTP API, you might break these up
    runner.add('stage_config', async function() {
      gitRoot   = await stf.gitRoot();
      confDir   = gitRoot.cwd('config');
      config    = await confDir.readAsync(`${stage}-config.json`, 'jsonWithDates');
      cconfig   = await confDir.readAsync(`claudia-${stage}.json`, 'jsonWithDates');
    });

    // Totally specific to the update task, but has all the pieces.
    runner.add('update', ['stage_config'], async function() {
      var params = {
        config:     config.config,
        version:    config.version,
        stage
      };

      params = kv(params, 'set_env_from_json', argv.set_env_from_json   || config.set_env_from_json);
      params = kv(params, 'use_s3_bucket',     argv.use_s3_bucket       || config.use_s3_bucket);

      const result = await claudiaUpdate(params);
      console.log(`claudia update`, {result});
    });

    // The start() function is boilerplate, except that the string 'update' would many times be passed
    // in (like from argv), if you have a more complexicated dependency tree

    // Kick it all off. ---- boilerplate start
    runner.start('update', function(err) {
      runner.reportDone(resolve, reject, err, {});
    });
  });
});
// Kick it all off. ---- boilerplate end
