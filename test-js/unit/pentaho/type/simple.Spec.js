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
  "pentaho/type/Context",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Context, bundle) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Element = context.get("pentaho/type/element"),
      Simple  = context.get("pentaho/type/simple");

  describe("pentaho.type.Simple -", function() {
    function expectThrow(spec, errorMessage) {
      expect(function() {
        new Simple(spec);
      }).toThrowError(errorMessage);
    }

    function constructWithValue(spec) {
      if(spec != null) {
        var simpleType = new Simple(spec);
        expect(simpleType.value).toBe(spec);
      } else {
        expectThrow(spec, bundle.structured.errors.value.isNull);
      }
    }

    function constructWithObject(v, f) {
      var spec = {};
      if(v != null && f != null) {
        spec = {value: v, formatted: f};
      }

      if(v != null) {
        var simpleType = new Simple(spec);
        expect(simpleType.value).toBe(v);
        expect(simpleType.formatted).toBe(f);
      } else {
        expectThrow(spec, bundle.structured.errors.value.isNull);
      }

      return spec;
    }

    function constructWithSimple(value, formatted) {
      var spec = new Simple(constructWithObject(value, formatted));
      var simpleType = new Simple(spec);

      expect(simpleType.value).toBe(value);
      expect(simpleType.formatted).toBe(formatted);
    }

    it("should be a function", function() {
      expect(typeof Simple).toBe("function");
    });

    it("should be a sub-class of `Element`", function() {
      expect(Simple.prototype instanceof Element).toBe(true);
    });

    describe("new Simple() -", function() {
      it("Creating with a Object", function() {
        constructWithObject();
        constructWithObject(null);
        constructWithObject(true, "true");
        constructWithObject(123, "123");
        constructWithObject("simple", "simple");
      });

      it("Creating with other Simple", function() {
        constructWithSimple(true, "true");
        constructWithSimple(123, "123");
        constructWithSimple("simple", "Simple");
      });

      it("Creating with a value", function() {
        constructWithValue();
        constructWithValue(null);
        constructWithValue(true);
        constructWithValue(123);
        constructWithValue("simple");
        constructWithValue(new Element());
      });
    });

    describe("#clone -", function() {
      it("The cloned object should be equal to the original", function() {
        var original = new Simple(constructWithObject(true, "true"));
        var clone = original.clone();

        expect(clone).not.toBe(original);
        expect(clone.value).toBe(original.value);
        expect(clone.formatted).toBe(original.formatted);
      });
    });

    describe("#value -", function() {
      var simpleType;

      beforeEach(function() {
        simpleType = new Simple(123);
      });

      function setValueExpectedThrow(value, errorMessage) {
        expect(function() {
          simpleType.value = value;
        }).toThrowError(errorMessage);

        expect(function() {
          simpleType.v = value;
        }).toThrowError(errorMessage);
      }

      it("Should return the given value in the constructor", function() {
        expect(simpleType.value).toBe(123);
      });

      it("Cannot change the primitive value of a simple value", function() {
        setValueExpectedThrow(456, bundle.structured.errors.value.cannotChangeValue);
      });

      it("Nothing should happen when setting the underlying primitive value with the same value", function() {
        expect(function() {
          simpleType.value = 123;
        }).not.toThrow();
        expect(simpleType.value).toBe(123);
      });

      it("Simple value cannot contain null", function() {
        setValueExpectedThrow(null, bundle.structured.errors.value.isNull);
      });
    });

    describe("#formatted -", function() {
      var simpleType;
      beforeEach(function() {
        simpleType = new Simple(123);
      });

      function testNullValue(value) {
        simpleType.formatted = value;
        expect(simpleType.formatted).toBe(null);
        simpleType.f = value;
        expect(simpleType.formatted).toBe(null);
      }

      function testFormattedValue(value) {
        simpleType.formatted = value;
        expect(simpleType.formatted).toBe(value);
        simpleType.f = value + "f";
        expect(simpleType.formatted).toBe(value + "f");
      }

      it("Should return null if set with nully or empty values", function() {
        testNullValue(null);
        testNullValue(undefined);
        testNullValue("");
      });

      it("Should return the formatted value if set with a non empty String", function() {
        testFormattedValue("foobar");
      });
    });

    describe("#valueOf -", function() {
      it("Should return the given value in the constructor", function() {
        var simpleType = new Simple(123);
        expect(simpleType.valueOf()).toBe(123);
      });
    });

    describe("#toString -", function() {
      it("Should return the same value as formatted", function() {
        var simpleType = new Simple(constructWithObject(123, "123"));
        expect(simpleType.toString()).toBe(simpleType.formatted);
      });

      it("Should return the value converted to a string if 'formatted' is not defined", function() {
        var simpleType = new Simple(123);
        expect(simpleType.toString()).toBe("123");
      });
    });

    describe("#key -", function() {
      it("Should convert the given value to a string", function() {
        var simpleType = new Simple(123);
        expect(simpleType.key).toBe(String(123));
      });
    });

    describe(".Meta -", function() {
      var ElemMeta = Simple.Meta;

      it("should be a function", function() {
        expect(typeof ElemMeta).toBe("function");
      });

      it("should be a sub-class of `Element.Meta`", function() {
        expect(ElemMeta.prototype instanceof Element.Meta).toBe(true);
      });

      describe("#cast -", function() {
        var SimpleMeta, Derived;

        beforeEach(function() {
          SimpleMeta = Simple.meta;
          Derived = Simple.extend({meta: {
            cast: function (value) {
              var n = parseFloat(value);
              if (isNaN(n)) throw new Error("Invalid value");
              return n;
            }
          }});
        });

        function expectCastError(meta, value, message) {
          expect(function() {
            meta.cast(value);
          }).toThrowError(message);
        }

        it("Default cast should return the value unchanged", function() {
          var original = 123;
          var final = SimpleMeta.cast(original);

          expect(original).toBe(final);
        });

        it("Cannot cast null values", function() {
          expectCastError(SimpleMeta, null, bundle.structured.errors.value.isNull)
        });

        it("Top cast function should throw an error message when cast function returns nully (null or undefined).", function() {
          var errorMessage = bundle.format(bundle.structured.errors.value.cannotConvertToType, [SimpleMeta.label]);

          SimpleMeta.cast = function(value) {
            return value === 0 ? null : value;
          };
          expectCastError(SimpleMeta, 0, errorMessage);

          SimpleMeta.cast = function(value) {
            return value === 0 ? undefined : value;
          };
          expectCastError(SimpleMeta, 0, errorMessage);
        });

        it("Should have changed the default cast behaviour and return an error if not a number", function() {
          expect(Derived.meta.cast("1")).toBe(1);
          expectCastError(Derived.meta, "a", "Invalid value");
        });

        it("Setting cast to a falsy value restores the default cast function (identity)", function() {
          var value = "123";
          expect(Derived.meta.cast(value)).toBe(123);
          Derived.meta.cast = null;
          expect(Derived.meta.cast(value)).toBe(value);
        });
      });
    });
  });
});
