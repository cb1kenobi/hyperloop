var child = require('child_process'),
  path = require('path'),
  exec = child.exec,
  spawn = child.spawn;

var BIN = './node_modules/.bin/',
  TEST_SRC = ['test/bin/*_test.js', 'test/lib/**/*.js'];

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    mochaTest: {
      options: {
        require: ['should'],
        timeout: 3000,
        ignoreLeaks: false,
        reporter: 'spec'
      },
      src: TEST_SRC
    },
    jshint: {
      options: {
        camelcase: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        indent: 4,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        nonew: true,
        undef: true,
        unused: true,
        trailing: true,
        loopfunc: true,
        proto: true,
        node: true,
        '-W104': true, // 'const' is only available in JavaScript 1.7
        '-W068': true  // Wrapping non-IIFE function literals in parens is unnecessary
      },
      tests: {
        options: {
          expr: true,
          unused: false,
          globals: {
            describe: false,
            it: false,
            before: false,
            beforeEach: false,
            after: false,
            afterEach: false
          }
        },
        src: ['test/**/*.js']
      },
      src: ['lib/**/*.js', 'bin/*']
    },
    coverage: {
      src: TEST_SRC
    },
    clean: {
      cov: ['coverage'],
      test: ['_tmp']
    }
  });

  // Load grunt plugins for modules
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // test coverage
  grunt.registerMultiTask('coverage', 'generate test coverage report', function() {
    var done = this.async(),
      cmd = BIN + 'istanbul cover --report html ' + BIN + '_mocha -- -r should -R min';

    this.filesSrc.forEach(function(file) {
      cmd += ' "' + file + '"';
    });

    grunt.log.debug(cmd);
    exec(cmd, function(err, stdout, stderr) {
      if (err) { grunt.fail.fatal(err); }
      if (/No coverage information was collected/.test(stderr)) {
        grunt.fail.warn('No coverage information was collected. Report not generated.');
      } else {
        grunt.log.ok('test coverage report generated to "./coverage/index.html"');
      }
      done();
    });
  });

  // run tests
  grunt.registerTask('test', 'run tests', function(type) {

    // run the original test suite, not currently tied to travis or coverage reports
    // TODO: remove this option once new testing covers the same cases
    if (type === 'old') {
      var done = this.async(),
        cmd = BIN + '_mocha',
        args = ['--require', 'lib/test', '--recursive', '--reporter', 'list', './specs', '--timeout', '60s'];

      grunt.log.debug(cmd + ' ' + args.join(' '));

      var _mocha = spawn(cmd, args);
      _mocha.stdout.on('data', function(data) {
        if (!(/^[\s\r\n\t]*$/.test(data)) && !(/: \x1b\x5b\x30\x6d$/.test(data))) {
          process.stdout.write(data);
        }
      });
      _mocha.stderr.on('data', function(data) {
        process.stdout.write(data);
      });
      _mocha.on('close', function(code) {
        if (code !== 0) {
          console.error('return code: ' + code);
        }
      });

    // run the new mocha tests used with travis and coverage reports
    } else {
      grunt.task.run('mochaTest' + (type ? ':' + type : ''));
    }
  });

  // Register tasks
  grunt.registerTask('default', ['test', 'clean:test']);

};