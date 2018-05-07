/*!
 * HITACHI VANTARA PROPRIETARY AND CONFIDENTIAL
 *
 * Copyright 2002 - 2017 Hitachi Vantara. All rights reserved.
 *
 * NOTICE: All information including source code contained herein is, and
 * remains the sole property of Hitachi Vantara and its licensors. The intellectual
 * and technical concepts contained herein are proprietary and confidential
 * to, and are trade secrets of Hitachi Vantara and may be covered by U.S. and foreign
 * patents, or patents in process, and are protected by trade secret and
 * copyright laws. The receipt or possession of this source code and/or related
 * information does not convey or imply any rights to reproduce, disclose or
 * distribute its contents, or to manufacture, use, or sell anything that it
 * may describe, in whole or in part. Any reproduction, modification, distribution,
 * or public display of this information without the express written authorization
 * from Hitachi Vantara is strictly prohibited and in violation of applicable laws and
 * international treaties. Access to the source code contained herein is strictly
 * prohibited to anyone except those individuals and entities who have executed
 * confidentiality and non-disclosure agreements or other agreements with Hitachi Vantara,
 * explicitly covering such access.
 */

// noinspection JSRemoveUnnecessaryParentheses
// noinspection BadExpressionStatementJS
({
  //The top level directory that contains your app. If this option is used
  //then it assumed your scripts are in a subdirectory under this path.
  //If this option is specified, then all the files from the app directory
  //will be copied to the dir: output area, and baseUrl will assume to be
  //a relative path under this directory.
  appDir: "${project.build.directory}/src-javascript",

  //How to optimize all the JS files in the build output directory.
  optimize: "${js.build.optimizer}",

  //By default, all modules are located relative to this path. If appDir is set, then
  //baseUrl should be specified as relative to the appDir.
  baseUrl: ".",

  //The directory path to save the output. All relative paths are relative to the build file.
  dir: "${project.build.directory}/build-javascript",

  //As of RequireJS 2.0.2, the dir above will be deleted before the
  //build starts again. If you have a big build and are not doing
  //source transforms with onBuildRead/onBuildWrite, then you can
  //set keepBuildDir to true to keep the previous dir. This allows for
  //faster rebuilds, but it could lead to unexpected errors if the
  //built code is transformed in some way.
  keepBuildDir: false,

  optimizeCss: "none",

  skipDirOptimize: false,

  paths: {

  },

  mainConfigFile: '${project.build.directory}/requireCfg.js',

  // Runtime Bundles Configuration
  // ----
  // Use the following option with a r.js of version >= 2.2.0 to
  // automatically generate the RequireJS `bundles` configuration.
  // Currently, this requires building build-utils-js locally and
  // to manually copy the output of this file into
  //   'src/main/javascript/scripts/analyzer-require-js-bundles-cfg.js'.
  // After 8.0, we can consider updating RequireJS globally.
  // Because this file defines `modules` in an incorrect way
  // (the bundle names should have the "analyzer/" prefix),
  // the output of this file actually has to be adapted for this to work.
  // Again. Post-8.0, a smoother workflow can be devised.

  bundlesConfigOutFile: '${basedir}/src/main/config/resources/requireCfg.bundles.js',

  //If using UglifyJS2 for script optimization, these config options can be
  //used to pass configuration values to UglifyJS2.
  //For possible `output` values see:
  //https://github.com/mishoo/UglifyJS2#beautifier-options
  //For possible `compress` values see:
  //https://github.com/mishoo/UglifyJS2#compressor-options
  uglify2: {
    output: {
      max_line_len: 80,
      beautify: false
    },
    warnings: false,
    mangle: true,
    compress: true
  },

  //If set to true, any files that were combined into a build bundle will be
  //removed from the output folder.
  removeCombined: true,

  //By default, comments that have a license in them are preserved in the
  //output when a minifier is used in the "optimize" option.
  //However, for a larger built files there could be a lot of
  //comment files that may be better served by having a smaller comment
  //at the top of the file that points to the list of all the licenses.
  //This option will turn off the auto-preservation, but you will need
  //work out how best to surface the license information.
  //NOTE: As of 2.1.7, if using xpcshell to run the optimizer, it cannot
  //parse out comments since its native Reflect parser is used, and does
  //not have the same comments option support as esprima.
  // preserveLicenseComments: false,

  modules: [
    {
      name: "pentaho/platformBundle",
      excludeShallow: [
        "pentaho/i18n",
        "pentaho/i18n/MessageBundle",
        "pentaho/service"
      ],
      exclude: [
        // Exclude AMD loader plugins
        // "cdf/lib/require-css/css",
        // "common-ui/util/require-css/css",
        // "pentaho/type/themes/ruby/model",
        // "common-ui/util/require-text/text",

        // Exclude CSS's that contain url(...) as these get messed up.
        // Must exclude the JS that asks for a CSS with the same name:
        "pentaho/visual/models/theme/model",
        "pentaho/type/theme/model",

        "cdf/lib/CCC/def",
        "cdf/lib/CCC/pvc",
        "cdf/lib/CCC/cdo",
        "cdf/lib/CCC/protovis",

        "css",
        "text",
        "json"

        // Unfortunately this is included as a global scope external resource (in common-ui).
        // It is asked to requirejs synchronously, before our bundled version could be used.
        // So there is no point in including it (and all of its dojo dependencies) in the bundle.
        // "common-ui/util/URLEncoder"
      ],
      create: false
    }
  ]
})
