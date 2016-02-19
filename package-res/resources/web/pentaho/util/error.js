/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "./object"
], function(O) {

  "use strict";

  /*global TypeError:false, RangeError:false*/

  /**
   * The `error` namespace contains factory functions for
   * creating `Error` instances for common error conditions
   * that arise in API design.
   *
   * @namespace
   * @memberOf pentaho.util
   * @amd pentaho/util/error
   * @ignore
   */
  var error = /** @lends pentaho.util.error */ {
    /**
     * Creates an `Error` object for a case where a required
     * function argument was not specified or was specified _nully_ or empty.
     *
     * The name of the argument can be that of a nested property,
     * like, for example, `"keyArgs.description"`.
     *
     * It is up to the caller to actually `throw` the returned `Error` object.
     * This makes flow control be clearly visible at the call site.
     *
     * Also, it is up to the caller to define what exactly "required" mean;
     * that an argument must be:
     * * specified - `if(arguments.length < 1) ...`
     * * truthy - `if(!value) ...`
     * * not nully - `if(value == null) ...`
     * * not nully or an empty string - `if(value == null || value === "") ...`
     * * ...
     *
     * The `name` property of the returned error object has the value `"ArgumentRequiredError"`.
     * Additionally, the `argument` property has the name of the argument.
     *
     * @example
     *
     * define(["pentaho/util/error"], function(error) {
     *
     *   function add(member) {
     *
     *     // Member cannot be null or undefined
     *     if(member == null) {
     *       throw error.argRequired("member");
     *     }
     *
     *     // Safe to add member
     *     this._members.push(member);
     *   }
     *
     *   // ...
     * });
     *
     * @param {string} name The name of the argument.
     * @param {?string} [text] Optional text further explaining the reason why the argument is required.
     * Can be useful when "being required" is a dynamic rule.
     *
     * @return {!Error} The created `Error` object.
     */
    argRequired: function(name, text) {
      return createError(
          Error,
          andSentence("Argument " + name + " is required.", text),
          {name: "ArgumentRequiredError", argument: name});
    },

    /**
     * Creates an `Error` object for a case where a function argument
     * has been specified, albeit with an invalid value.
     *
     * The name of the argument can be that of a nested property,
     * like, for example, `"keyArgs.description"`.
     *
     * It is up to the caller to actually `throw` the returned `Error` object.
     * This makes flow control be clearly visible at the call site.
     *
     * An argument's value can be considered **invalid** because:
     * * it is not of one of the supported, documented types -
     *   use [argInvalidType]{@link pentaho.util.error.argInvalidType} instead
     * * the specific value is not supported, or is out of range -
     *   use [argOutOfRange]{@link pentaho.util.error.argOutOfRange} instead
     * * the value is not in an acceptable state
     * * the value refers to something which does not exist (like a dictionary _key_ which is undefined)
     * * ...
     *
     * You should use this error if none of the other more specific
     * invalid argument errors applies.
     *
     * The `name` property of the returned error object has the value `"ArgumentInvalidError"`.
     * Additionally, the `argument` property has the name of the argument.
     *
     * @example
     *
     * define(["pentaho/util/error"], function(error) {
     *
     *   function connect(channel) {
     *
     *     if(channel && channel.isOpened) {
     *       throw error.argInvalid("channel", "Channel not free to use.");
     *     }
     *
     *     var handle = channel.open();
     *     // ...
     *   }
     *
     *   // ...
     * });
     *
     * @param {string} name The name of the argument.
     * @param {string} reason Text that explains the reason why the argument is considered invalid.
     * @return {!Error} The created `Error` object.
     */
    argInvalid: function(name, reason) {
      return createError(
          Error,
          andSentence("Argument " + name + " is invalid.", reason),
          {name: "ArgumentInvalidError", argument: name});
    },

    /**
     * Creates a `TypeError` object for a case where a function argument
     * has been specified, albeit with a value of an unsupported type,
     * according to the documented contract.
     *
     * The name of the argument can be that of a nested property,
     * like, for example, `"keyArgs.description"`.
     *
     * It is up to the caller to actually `throw` the returned `TypeError` object.
     * This makes flow control be clearly visible at the call site.
     *
     * Types can be:
     * * one of the possible results of the `typeof` operator,
     *   like `"number"`, `"string"`, `"boolean"`, `"function"`, ...
     * * the name of global classes/constructors,
     *   that would be testable by use of the `instanceof` operator or
     *   by accessing the `constructor` property,
     *   like `"Array"`, `"Object"`, or `"HTMLElement"`
     * * the id of an AMD module that returns a constructor or factory, like `"pentaho/type/complex"`.
     *
     * The `name` property of the returned error object has the value `"ArgumentInvalidTypeError"`.
     * Additionally, the `argument` property has the name of the argument.
     * Property `expectedTypes` contains an array of the expected type names, and,
     * property `actualType`, the name of the actual type, if specified, or `undefined`.
     *
     * @example
     *
     * define(["pentaho/util/error"], function(error) {
     *
     *   function createInstance(type, args) {
     *     var TypeCtor;
     *
     *     switch(typeof type) {
     *       case "string":
     *         TypeCtor = window[type];
     *         break;
     *
     *       case "function":
     *         TypeCtor = type;
     *         break;
     *
     *       default:
     *         throw error.argInvalidType("type", ["string", "function"], typeof type);
     *     }
     *
     *     // ...
     *   }
     *
     *   // ...
     * });
     *
     * @param {string} name The name of the argument.
     * @param {string|string[]} expectedType The name or names of the expected types.
     * @param {string} [actualType] The name of the received type, when known.
     * @return {!TypeError} The created `TypeError` object.
     */
    argInvalidType: function(name, expectedType, actualType) {
      var typesMsg = "Expected type to be ";

      if(!Array.isArray(expectedType)) expectedType = [expectedType];

      if(expectedType.length > 1) {
        var expectedTypesClone = expectedType.slice();
        var lastExpectedType = expectedTypesClone.pop();
        typesMsg += "one of " + expectedTypesClone.join(", ") + " or " + lastExpectedType;
      } else {
        // If should have at least one entry...
        typesMsg += expectedType[0];
      }

      typesMsg += actualType ? (", but got " + actualType + ".") : ".";

      return createError(
          TypeError,
          andSentence("Argument " + name + " is invalid.", typesMsg),
          {
            name: "ArgumentInvalidTypeError",
            argument: name,
            actualType: actualType,
            expectedTypes: expectedType
          });
    },

    /**
     * Creates an `RangeError` object for a case where a function argument
     * was specified with a value of one of the expected types,
     * albeit not within the expected range.
     *
     * The name of the argument can be that of a nested property,
     * like, for example, `"keyArgs.index"`.
     *
     * It is up to the caller to actually `throw` the returned `RangeError` object.
     * This makes flow control be clearly visible at the call site.
     *
     * The `name` property of the returned error object has the value `"ArgumentOutOfRangeError"`.
     * Additionally, the `argument` property has the name of the argument.
     *
     * @example
     *
     * define(["pentaho/util/error"], function(error) {
     *
     *   function insertAt(element, index) {
     *
     *     if(index < 0 || index > this.length) {
     *       throw error.argOutOfRange("index");
     *     }
     *
     *     // Safe to insert at index
     *     this._elements.splice(index, 0, element);
     *   }
     *
     *   // ...
     * });
     *
     * @param {string} name The name of the argument.
     * @return {!RangeError} The created `RangeError` object.
     */
    argOutOfRange: function(name) {
      return createError(
          RangeError,
          "Argument " + name + " is out of range.",
          {name: "ArgumentOutOfRangeError", argument: name});
    },

    /**
     * Creates an `Error` object for a case where performing an operation is considered invalid.
     *
     * It is up to the caller to actually `throw` the returned `Error` object.
     * This makes flow control be clearly visible at the call site.
     *
     * Performing an operation can be considered **invalid** when:
     * * the object in which it is executed is not in a state that allows the operation to be performed,
     *   like it is _locked_, _busy_ or _disposed_.
     * * it cannot be performed on a certain type of object
     * * ...
     *
     * The `name` property of the returned error object has the value `"OperationInvalidError"`.
     *
     * @example
     *
     * define(["pentaho/util/error"], function(error) {
     *
     *   function Cell(value) {
     *     this._value = value;
     *     this._locked = false;
     *   }
     *
     *   Cell.prototype = {
     *     lock: function() {
     *       this._locked = true;
     *     },
     *
     *     get value() {
     *       return this._value;
     *     },
     *
     *     set value(v) {
     *       if(this._locked) {
     *         throw error.operInvalid("Cell is locked.");
     *       }
     *
     *       this._value = v;
     *     }
     *   };
     *
     *   // ...
     * });
     *
     * @param {string} reason Text that explains the reason why performing the operation is considered invalid.
     * @return {!Error} The created `Error` object.
     */
    operInvalid: function(reason) {
      return createError(
          Error,
          andSentence("Operation invalid.", reason),
          {name: "OperationInvalidError"});
    },

    /**
     * Creates an `Error` object for a case where an _abstract_ method has not been implemented/overridden
     * and is being called.
     *
     * It is up to the caller to actually `throw` the returned `Error` object.
     * This makes flow control be clearly visible at the call site.
     *
     * The `name` property of the returned error object has the value `"NotImplementedError"`.
     *
     * @param {?string} [text] Complementary text.
     * @return {!Error} The created `Error` object.
     */
    notImplemented: function(text) {
      return createError(
          Error,
          andSentence("Not Implemented.", text),
          {name: "NotImplementedError"});
    }
  };

  return error;

  /**
   * Creates an error object of a given type and with a given message and properties.
   *
   * @param {Class.<Error>} ErrorCtor The error constructor.
   * @param {string} message The error message.
   * @param {?Object} [props] A map of properties to extend the error object with.
   *
   * @return {Error} The created error object.
   */
  function createError(ErrorCtor, message, props) {
    return O.assignOwn(new ErrorCtor(message), props);
  }

  /**
   * Appends a sentence to another,
   * making sure that the appended sentence ends with a period or is, otherwise,
   * terminated by a punctuation character.
   *
   * @param {string} text The initial sentence.
   * @param {?string} [sentence] A sentence to append to `text`, that can not be properly terminated.
   * @return {string} A new, terminated sentence.
   */
  function andSentence(text, sentence) {
    return text + (sentence ? (" " + withPeriod(sentence)) : "");
  }

  /**
   * Ensures a sentence is terminated with a period or another punctuation character,
   * like `;`, `?` or `!`.
   *
   * @param {string} sentence A possibly unterminated sentence.
   * @return {string} A new, terminated sentence.
   */
  function withPeriod(sentence) {
    return sentence && !/[.;!?]/.test(sentence[sentence.length - 1]) ? (sentence + ".") : sentence;
  }
});
