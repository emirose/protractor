#!/usr/bin/env node

var Executor = require('./test/test_util').Executor;

var passingTests = [
  'node built/cli.js spec/basicConf.js',
  'node built/cli.js spec/multiConf.js',
  'node built/cli.js spec/altRootConf.js',
  'node built/cli.js spec/onCleanUpAsyncReturnValueConf.js',
  'node built/cli.js spec/onCleanUpNoReturnValueConf.js',
  'node built/cli.js spec/onCleanUpSyncReturnValueConf.js',
  'node built/cli.js spec/onPrepareConf.js',
  'node built/cli.js spec/onPrepareFileConf.js',
  'node built/cli.js spec/onPreparePromiseConf.js',
  'node built/cli.js spec/onPreparePromiseFileConf.js',
  'node built/cli.js spec/mochaConf.js',
  'node built/cli.js spec/withLoginConf.js',
  'node built/cli.js spec/suitesConf.js --suite okmany',
  'node built/cli.js spec/suitesConf.js --suite okspec',
  'node built/cli.js spec/suitesConf.js --suite okmany,okspec',
  'node built/cli.js spec/plugins/smokeConf.js',
  'node built/cli.js spec/plugins/multiPluginConf.js',
  'node built/cli.js spec/plugins/jasminePostTestConf.js',
  'node built/cli.js spec/plugins/mochaPostTestConf.js',
  'node built/cli.js spec/plugins/browserGetSyncedConf.js',
  'node built/cli.js spec/plugins/browserGetUnsyncedConf.js',
  'node built/cli.js spec/plugins/waitForAngularConf.js',
  'node built/cli.js spec/interactionConf.js',
  'node built/cli.js spec/directConnectConf.js',
  'node built/cli.js spec/restartBrowserBetweenTestsConf.js',
  'node built/cli.js spec/getCapabilitiesConf.js',
  'node built/cli.js spec/controlLockConf.js',
  'node built/cli.js spec/customFramework.js',
  'node built/cli.js spec/noGlobalsConf.js',
  'node built/cli.js spec/angular2Conf.js',
  'node scripts/attachSession.js',
  'node scripts/interactive_tests/interactive_test.js',
  'node scripts/interactive_tests/with_base_url.js',
  // Unit tests
  'node node_modules/jasmine/bin/jasmine.js JASMINE_CONFIG_PATH=scripts/unit_test.json',
];

var executor = new Executor();

passingTests.forEach(function(passing_test) {
  executor.addCommandlineTest(passing_test)
      .assertExitCodeOnly();
});

/*************************
 *Below are failure tests*
 *************************/

// assert stacktrace shows line of failure
executor.addCommandlineTest('node built/cli.js spec/errorTest/singleFailureConf.js')
    .expectExitCode(1)
    .expectErrors({
      stackTrace: 'single_failure_spec1.js:5:32'
    });

// assert timeout works
executor.addCommandlineTest('node built/cli.js spec/errorTest/timeoutConf.js')
    .expectExitCode(1)
    .expectErrors({
      message: 'Timeout - Async callback was not invoked within timeout ' +
          'specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.'
    })
    .expectTestDuration(0, 100);

executor.addCommandlineTest('node built/cli.js spec/errorTest/afterLaunchChangesExitCodeConf.js')
    .expectExitCode(11)
    .expectErrors({
      message: 'Expected \'Hiya\' to equal \'INTENTIONALLY INCORRECT\'.'
    });

executor.addCommandlineTest('node built/cli.js spec/errorTest/multiFailureConf.js')
    .expectExitCode(1)
    .expectErrors([{
      message: 'Expected \'Hiya\' to equal \'INTENTIONALLY INCORRECT\'.',
      stacktrace: 'single_failure_spec1.js:5:32'
    }, {
      message: 'Expected \'Hiya\' to equal \'INTENTIONALLY INCORRECT\'.',
      stacktrace: 'single_failure_spec2.js:5:32'
    }]);

executor.addCommandlineTest('node built/cli.js spec/errorTest/shardedFailureConf.js')
    .expectExitCode(1)
    .expectErrors([{
      message: 'Expected \'Hiya\' to equal \'INTENTIONALLY INCORRECT\'.',
      stacktrace: 'single_failure_spec1.js:5:32'
    }, {
      message: 'Expected \'Hiya\' to equal \'INTENTIONALLY INCORRECT\'.',
      stacktrace: 'single_failure_spec2.js:5:32'
    }]);

executor.addCommandlineTest('node built/cli.js spec/errorTest/mochaFailureConf.js')
    .expectExitCode(1)
    .expectErrors([{
      message: 'expected \'My AngularJS App\' to equal \'INTENTIONALLY INCORRECT\'',
      stacktrace: 'mocha_failure_spec.js:11:20'
    }]);

executor.addCommandlineTest('node built/cli.js spec/errorTest/pluginsFailingConf.js')
    .expectExitCode(1)
    .expectErrors([
      {message: 'Expected true to be false'},
      {message: 'from setup'},
      {message: 'from postTest passing'},
      {message: 'from postTest failing'},
      {message: 'from teardown'}
    ]);

executor.addCommandlineTest('node built/cli.js spec/errorTest/slowHttpAndTimeoutConf.js')
    .expectExitCode(1)
    .expectErrors([
      {message: 'The following tasks were pending[\\s\\S]*\\$http: slowcall'},
      {message: 'The following tasks were pending[\\s\\S]*' +
                '\\$timeout: function \\(\\) {[\\s\\S]*' +
                  '\\$scope\\.slowAngularTimeoutStatus = \'done\';[\\s\\S]' +
                '*}'}
    ]);

executor.addCommandlineTest('node built/cli.js spec/errorTest/slowHttpAndTimeoutConf.js ' +
                            '--untrackOutstandingTimeouts true')
    .expectExitCode(1)
    .expectErrors([
      {message: 'The following tasks were pending[\\s\\S]*\\$http: slowcall'},
      {message: '^((?!The following tasks were pending).)*$'}
    ]);

executor.execute();
