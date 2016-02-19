/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global require:false */

(function() {

  "use strict";

  var _nextUid = 1;

  /**
   * Creates a new RequireJS context and returns its require function.
   *
   * The configuration of the new context is cloned from that of the default RequireJS context.
   *
   * To dispose the RequireJS context, call the `dispose` method of the returned `require` function.
   *
   * @param {?Object} [keyArgs] Keyword arguments.
   * @param {Object} [keyArgs.mocks] Map of module ids to mocked values.
   *
   * @return {function} A contextual, disposable require function.
   */
  require.newContext = function(keyArgs) {
    // Advance `define` statements that are "intaken", at construction, by the new context.
    // Could also be done by the user before calling this. So it's just sugar.
    mockContext(keyArgs && keyArgs.mocks);

    var name = newContextName();
    var contextRequire = require.config(newContextConfig(name));

    contextRequire.dispose = delContext.bind(null, name);

    return contextRequire;
  };

  // ---

  function newContextName() {
    return "DISPOSABLE_" + (_nextUid++);
  }

  function getContext(name) {
    return require.s.contexts[name];
  }

  function delContext(name) {
    delete require.s.contexts[name];
  }

  function mockContext(mocks) {
    if(mocks) {
      Object.keys(mocks).forEach(function(id) {
        mockContextOne(id, mocks[id]);
      });
    }
  }

  function mockContextOne(id, value) {
    define(id, function() { return value; });
  }

  function newContextConfig(contextName) {
    var configClone = {
      context: contextName
    };

    var defaultConfig = getContext("_").config;

    Object.keys(defaultConfig).forEach(function(p) {
      switch(p) {
        // Don't make sense for non-default contexts:
        case "deps":
        case "callback":
        case "context": // shouldn't exist
          break;

        // Internal, derived state:
        case "pkgs":
          // ignore
          break;

        case "packages":
          if(this.packages) configClone.packages = this.packages.slice();
          break;

        case "shim":
          configClone.shim = cloneConfigShims(this.shim);
          break;

        // Object deep clone
        case "paths":
        case "bundles":
        case "config":
        case "map":
          configClone[p] = cloneDeep(this[p]);
          break;

        default:
          // Copy value. Includes:
          // * baseUrl
          // ...?
          configClone[p] = this[p];
      }

    }, defaultConfig);

    return configClone;
  }

  function cloneConfigShims(shims) {
    var shimsClone = {};

    Object.keys(shims).forEach(function(mid) {
      // Make sure to exclude internally computed property 'exportsFn'
      var shim = shims[mid];
      shimsClone[mid] = {deps: shim.deps, exports: shim.exports, init: shim.init};
    });

    return shimsClone;
  }

  // ---

  function cloneDeep(source) {
    if(typeof source === "object") {
      if(!source) return source; // null
      if(source instanceof Array) return source.map(cloneDeep);
      if(source.constructor === Object) {
        var target = {};
        Object.keys(source).forEach(function(p) { target[p] = cloneDeep(source[p]); });
        return target;
      }
      // Of Object subclasses (Date, Error, RegExp, ... ?)
    }
    // undefined, number, boolean, string, function
    return source;
  }
}());
