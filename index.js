
const stf         = require('./step-forward');
const libPower    = require('./lib/power');
const {
  _
}             = libPower;

_.each(stf, (v,k) => {
  exports[k] = v;
});

