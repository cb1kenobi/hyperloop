var sprintf = require('util').format,
  colors = require('colors'),
  log = require('./log'),
  timer;

var spinner = 'win32' == process.platform
    ? ['|','/','-','\\']
    : ['◜','◠','◝','◞','◡','◟'];

function play(arr, interval) {
  var len = arr.length
    , interval = interval || 100
    , i = 0;

  timer = setInterval(function(){
    var str = '\u001b[0G' + arr[i++ % len];
    process.stdout.write(log.useColor ? str : str.stripColors);
  }, interval);
}

exports.start = function(msg, prefix) {
  if (log.level === 'quiet') { return; }

  msg = msg || '';
  var frames = spinner.map(function(c) {
    var str = sprintf('  \u001b[96m%s \u001b[90m'+msg+'\u001b[0m', c);
    return log.useColor ? str : str.stripColors;
  });

  prefix && log.info(prefix);
  play(frames);
};

exports.stop = function() {
  if (timer){
    clearInterval(timer);
    timer=null;
  }
  log.log(' ');
  log.log(' ')
};
