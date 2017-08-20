var path = require('path');
var travisENV = process.env.NODE_ENV === 'travis';

module.exports = function(config) {
    console.log(process.env.NODE_ENV)
    config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        plugins: [
            'karma-mocha',
            'karma-chai',
            'karma-sinon',
            'karma-webpack',
            'karma-mocha-reporter',
            'karma-coverage-istanbul-reporter'
        ].concat(travisENV ? ['karma-firefox-launcher'] : ['karma-chrome-launcher']),

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['sinon', 'mocha', 'chai'],


        // list of files / patterns to load in the browser
        files: [
            'src/**/*.test.js'
        ],


        // list of files to exclude
        exclude: [
        ],

        webpack: {
            module: {
                rules: [{
                    test: /\.js$/,
                    use: ['istanbul-instrumenter-loader', 'babel-loader'],
                    include: path.join(__dirname, 'src')
                }]
            }
        },

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*.test.js': ['webpack']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'coverage-istanbul'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: travisENV ? ['Firefox'] : ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        coverageIstanbulReporter: {
            reports: ['text-summary', 'html', 'lcov'],
            dir: path.join(__dirname, 'coverage'),
            fixWebpackSourcePaths: true,
            'report-config': {
                subdir: 'html'
            }
        }
    })
}
