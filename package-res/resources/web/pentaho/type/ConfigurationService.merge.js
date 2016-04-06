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

define([
  "../lang/Base",
  "../util/object",
  "../util/error"
], function(Base, O, error) {

  "use strict";

  var _mergeHandlers = {
    "replace": mergeSpecsOperReplace,
    "merge":   mergeSpecsOperMerge,
    "add":     mergeSpecsOperAdd
  };

  return Base.extend({
    _mergeSpecsInto: mergeSpecsInto
  });

  /**
   * Merges a value type configuration specification into another.
   *
   * The target specification is modified,
   * but the source specification isn't.
   * The latter is actually deep-cloned, whenever full-subtrees are set at a target place,
   * to prevent future merges from inadvertently changing the source's internal structures.
   *
   * @alias _mergeSpecsInto
   * @memberOf pentaho.type.ConfigurationService#
   * @method
   *
   * @param {!pentaho.type.spec.IValueTypeProto} typeSpecTarget The target specification.
   * @param {!pentaho.type.spec.IValueTypeProto} typeSpecSource The source specification.
   *
   * @return {pentaho.type.spec.IValueTypeProto} The target specification.
   *
   * @protected
   */
  function mergeSpecsInto(typeSpecTarget, typeSpecSource) {

    for(var name in typeSpecSource)
      if(O.hasOwn(typeSpecSource, name))
        mergeSpecsOne(typeSpecTarget, name, typeSpecSource[name]);

    return typeSpecTarget;
  }

  /**
   * Merges one property into a target object,
   * given the source property name and value.
   *
   * @param {object} target The target object.
   * @param {string} name The source property name.
   * @param {any} sourceValue The source property value.
   */
  function mergeSpecsOne(target, name, sourceValue) {
    var op;

    if(isPlainJSObject(sourceValue)) {
      // Is `sourceValue` an operation structure?
      //   {$op: "merge", value: {}}
      if((op = sourceValue.$op)) {
        // Always deref source value, whether or not `op` is merge.
        sourceValue = sourceValue.value;

        // Merge operation only actually applies between two plain objects,
        // and otherwise behaves like _replace_.
        if(op === "merge" && isPlainJSObject(sourceValue)) op = "replace";
      } else {
        op = "merge";
      }
    }

    var handler = O.getOwn(_mergeHandlers, op || "replace");
    if(!handler)
      throw error.operInvalid("Merge operation '" + op + "' is not defined.");

    handler(target, name, sourceValue);
  }

  function mergeSpecsOperMerge(target, name, sourceValue) {

    // assert isPlainJSObject(sourceValue)

    // Is `targetValue` also a plain object?
    var targetValue = target[name];
    if(isPlainJSObject(targetValue))
      mergeSpecsInto(targetValue, sourceValue);
    else
      mergeSpecsOperReplace(target, name, sourceValue);
  }

  function mergeSpecsOperReplace(target, name, sourceValue) {
    // Clone source value so that future merges into it don't change it, inadvertently.
    target[name] = cloneOwnDeep(sourceValue);
  }

  function mergeSpecsOperAdd(target, name, sourceValue) {
    // If both are arrays, append source to target, while cloning source elements.
    // Else, fallback to replace operation.
    var targetValue;
    if(Array.isArray(sourceValue) && Array.isArray((targetValue = target[name]))) {
      var i = -1;
      var L = sourceValue.length;
      while(++i < L)
        targetValue.push(cloneOwnDeep(targetValue[i]));

    } else {
      mergeSpecsOperReplace(target, name, sourceValue);
    }
  }

  /**
   * Checks if a value is a plain JavaScript object.
   *
   * @param {any} value The value to check.
   *
   * @return {boolean} `true` if it is, `false` if not.
   */
  function isPlainJSObject(value) {
    return (!!value) && (typeof value === "object") && (value.constructor === Object);
  }

  /**
   * Deep clones a value.
   *
   * For plain object values, only their own properties are included.
   *
   * @param {any} value The value to clone deeply.
   *
   * @return {any} The deeply cloned value.
   */
  function cloneOwnDeep(value) {
    if(value && typeof value === "object") {
      if(value instanceof Array) {
        value = value.map(cloneOwnDeep);
      } else if(value.constructor === Object) {
        var clone = {};
        O.eachOwn(value, function(vi, p) { this[p] = cloneOwnDeep(vi); }, clone);
        value = clone;
      }
    }

    return value;
  }
});
