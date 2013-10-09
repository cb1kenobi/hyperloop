var sprintf = require('util').format,
    timer;

function play(arr, interval) {
  var len = arr.length
    , interval = interval || 100
    , i = 0;

  timer = setInterval(function(){
    var str = arr[i++ % len];
    process.stdout.write('\u001b[0G' + str);
  }, interval);
}


var spinner = 'win32' == process.platform
    ? ['|','/','-','\\']
    : ['◜','◠','◝','◞','◡','◟'];


exports.start = function(msg) {
  msg = msg || '';
  var frames = spinner.map(function(c) {
      return sprintf('  \u001b[96m%s \u001b[90m'+msg+'\u001b[0m', c);
  });
  play(frames);
};

exports.stop = function() {
  if (timer){
    clearInterval(timer);
    timer=null;
  }
};
