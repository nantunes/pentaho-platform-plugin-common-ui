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
  "pentaho/type/boolean",
  "pentaho/type/Context",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(booleanFactory, Context, bundle) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho/type/boolean -", function() {
    it("is a function", function() {
      expect(typeof booleanFactory).toBe("function");
    });

    describe("new boolean()", function() {
      var PentahoBoolean;

      beforeEach(function() {
        PentahoBoolean = booleanFactory(new Context());
      });

      it("should be a function", function() {
        expect(typeof PentahoBoolean).toBe("function");
      });

      it("should return an object", function() {
        expect(typeof new PentahoBoolean(1)).toBe("object");
      });

      it("should accept 1 as true", function() {
        expect(new PentahoBoolean(1).value).toBe(true);
      });

      it("should accept '1' as true", function() {
        expect(new PentahoBoolean('1').value).toBe(true);
      });

      it("should accept 0 as false", function() {
        expect(new PentahoBoolean(0).value).toBe(false);
      });

      it("should accept '0' as true", function() {
        expect(new PentahoBoolean('0').value).toBe(true);
      });

      it("should accept true as true", function() {
        expect(new PentahoBoolean(true).value).toBe(true);
      });

      it("should accept false as false", function() {
        expect(new PentahoBoolean(false).value).toBe(false);
      });

      it("should accept 'false' as true", function() {
        expect(new PentahoBoolean('false').value).toBe(true);
      });

      it("should accept new Date() as true", function() {
        expect(new PentahoBoolean(new Date()).value).toBe(true);
      });

      it("should accept empty string as false", function() {
        expect(new PentahoBoolean('').value).toBe(false);
      });

      it("should accept some random string as true", function() {
        expect(new PentahoBoolean('someRandom string').value).toBe(true);
      });

      it("should not accept null", function() {
        expect(function() {
          new PentahoBoolean(null);
        }).toThrowError(bundle.structured.errors.value.isNull);
      });

      it("should not accept undefined", function() {
        expect(function() {
          new PentahoBoolean(undefined);
        }).toThrowError(bundle.structured.errors.value.isNull);
      });
    });
  }); // pentaho.type.Boolean
});