
const argv = require('minimist')(process.argv.slice(2));

const filepath                = argv._[0] || 'boo/ya/file.js';
var   parts                   = filepath.replace('\\', '/').split('/');
const filename                = parts.pop();

const jetpack                 = require('fs-jetpack');
const tDir                    = jetpack.cwd(__dirname, 'templates');
const destDir                 = jetpack.cwd(...parts);

const content     = tDir.read('stf-task.js');

console.log(tDir.cwd(), destDir.cwd(), {filename, parts}, content);

destDir.write(filename, content);
