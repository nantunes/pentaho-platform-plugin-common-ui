/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../../lang/Base",
  "../../lang/SortedList",
  "../../util/object",
  "../../util/error"
], function(Base, SortedList, O, error) {
  "use strict";

  var _selectCriteria = [
    "user",
    "theme",
    "locale",
    "application"
  ];

  function _ruleComparer(r1, r2) {
    var priority1 = r1.priority || 0;
    var priority2 = r2.priority || 0;

    if (priority1 !== priority2) {
      return priority1 > priority2 ? 1 : -1;
    }

    var s1 = r1.select || {};
    var s2 = r2.select || {};

    for (var i = 0, ic = _selectCriteria.length; i !== ic; ++i) {
      var key = _selectCriteria[i];

      var isDefined1 = s1[key] != null;
      var isDefined2 = s2[key] != null;

      if (isDefined1 !== isDefined2) {
        return isDefined1 ? 1 : -1;
      }
    }

    return r1._ordinal > r2._ordinal ? 1 : -1;
  }

  function _ruleFilterer(rule) {
    // The expected value of `this` is the criteria object

    var select = rule.select || {};
    for (var i = 0, ic = _selectCriteria.length; i !== ic; ++i) {
      var key = _selectCriteria[i];

      var possibleValues = select[key];

      if (possibleValues != null) {
        var criteriaValue = this[key];

        var multi = Array.isArray(possibleValues);
        if (!multi && possibleValues !== criteriaValue ||
          multi && possibleValues.indexOf(criteriaValue) === -1) {
          return false;
        }
      }
    }

    return true;
  }

  var _mergeHandlers = {
    "replace": mergeSpecsOperReplace,
    "merge": mergeSpecsOperMerge,
    "add": mergeSpecsOperAdd
  };

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

    for (var name in typeSpecSource)
      if (O.hasOwn(typeSpecSource, name))
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

    if (isPlainJSObject(sourceValue)) {
      // Is `sourceValue` an operation structure?
      //   {$op: "merge", value: {}}
      if ((op = sourceValue.$op)) {
        // Always deref source value, whether or not `op` is merge.
        sourceValue = sourceValue.value;

        // Merge operation only applies between two plain objects and
        // add operation only applies between two arrays.
        // Otherwise behaves like _replace_.
        if (op === "merge" && !isPlainJSObject(sourceValue) || op === "add" && !Array.isArray(sourceValue)) {
          op = "replace";
        }
      } else {
        op = "merge";
      }
    }

    var handler = O.getOwn(_mergeHandlers, op || "replace");
    if (!handler)
      throw error.operInvalid("Merge operation '" + op + "' is not defined.");

    handler(target, name, sourceValue);
  }

  function mergeSpecsOperMerge(target, name, sourceValue) {
    // Is `targetValue` also a plain object?
    var targetValue = target[name];
    if (isPlainJSObject(targetValue))
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
    if (Array.isArray(sourceValue) && Array.isArray((targetValue = target[name]))) {
      var i = -1;
      var L = sourceValue.length;
      while (++i < L)
        targetValue.push(cloneOwnDeep(sourceValue[i]));

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
    if (value && typeof value === "object") {
      if (value instanceof Array) {
        value = value.map(cloneOwnDeep);
      } else if (value.constructor === Object) {
        var clone = {};
        O.eachOwn(value, function(vi, p) {
          this[p] = cloneOwnDeep(vi);
        }, clone);
        value = clone;
      }
    }

    return value;
  }

  var _ruleCounter = 0;

  var ConfigurationService = Base.extend("pentaho.type.config.ConfigurationService", {
    /**
     * @private
     */
    _ruleStore: null,

    constructor: function() {
      this._ruleStore = {};
    },

    add: function(config) {
      if (config.rules) {
        config.rules.forEach(function(rule) {
          this.addRule(rule);
        }, this);
      }
    },

    addRule: function(rule) {
      // needed to make this explicit to keep the sorting
      // algorithm stable (insertion order would be lost on resorts)
      // also assuming the ConfigurationService takes ownership of
      // the rules, so mutating it directly is ok
      rule._ordinal = _ruleCounter++;

      var select = rule.select || {};
      var typeIds = select.type || ["pentaho/type/value"];
      if (!Array.isArray(typeIds)) {
        typeIds = [typeIds];
      }

      typeIds.forEach(function(typeId) {
        var type = toAbsTypeId(typeId);

        if (!this._ruleStore[type]) {
          this._ruleStore[type] = new SortedList({"comparer": _ruleComparer});
        }

        this._ruleStore[type].push(rule);
      }, this);
    },

    select: function(typeId, criteria) {
      var type = toAbsTypeId(typeId);

      var rules = this._ruleStore[type] || [];
      var filtered_rules = rules.filter(_ruleFilterer, criteria || {});
      var configs = filtered_rules.map(function(rule) {
        return rule.apply;
      });

      if (configs.length === 0) {
        return null;
      }

      var config = configs.reduce(mergeSpecsInto, {});

      return config;
    }
  });

  return ConfigurationService;

  function toAbsTypeId(id) {
    return id.indexOf("/") < 0 ? ("pentaho/type/" + id) : id;
  }
});
