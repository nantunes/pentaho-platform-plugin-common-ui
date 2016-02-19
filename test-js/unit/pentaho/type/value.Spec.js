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
  "pentaho/type/Item",
  "pentaho/type/Context",
  "pentaho/util/error",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Item, Context, error, bundle) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  var context = new Context(),
      Value = context.get("pentaho/type/value"),
      Number = context.get("pentaho/type/number");

  describe("pentaho/type/value -", function() {

    it("should be a function", function() {
      expect(typeof Value).toBe("function");
    });

    it("should be a sub-class of `Item`", function() {
      expect(Value.prototype instanceof Item).toBe(true);
    });

    describe(".Meta -", function() {
      var valueMeta;
      var Value;
      var myContext;

      beforeEach( function() {
        // making sure that we have a new Value definition for each test
        myContext = new Context();
        Value = myContext.get("pentaho/type/value");
        valueMeta = Value.meta;
      });

      it("should be a function", function() {
        expect(typeof Value.Meta).toBe("function");
      });

      it("should be a sub-class of `Item.Meta`", function() {
        expect(valueMeta instanceof Item.Meta).toBe(true);
      });

      it("should have an `uid`", function() {
        expect(valueMeta.uid != null).toBe(true);
        expect(typeof valueMeta.uid).toBe("number");
      });

      describe("#context()", function() {
        it("the Value meta has the context in which it was defined", function() {
          var myContext = new Context();
          var Value = myContext.get("pentaho/type/value");

          expect(Value.meta.context).toBe(myContext);
        });
      }); // end #context

      describe("#list", function() {
        it("should have default `list` equal to `undefined`", function () {
          expect(valueMeta.list).toBe(undefined);
        });
      }); // end #list

      describe("#abstract", function() {
        it("should have default `abstract` equal to `true`", function () {
          expect(valueMeta.abstract).toBe(true);
        });

        it("should allow changing `abstract` value", function () {
          valueMeta.abstract = false;
          expect(valueMeta.abstract).toBe(false);
          valueMeta.abstract = true;
          expect(valueMeta.abstract).toBe(true);
        });
      }); // end #abstract

      describe("#areEqual(va, vb)", function() {
        it("should return `true` if both values are nully", function() {
          expect(Value.meta.areEqual(null, null)).toBe(true);
          expect(Value.meta.areEqual(undefined, undefined)).toBe(true);
          expect(Value.meta.areEqual(null, undefined)).toBe(true);
          expect(Value.meta.areEqual(undefined, null)).toBe(true);
        });

        it("should return `false` if only one of the values is nully", function() {
          var va = new Value();

          expect(Value.meta.areEqual(null, va)).toBe(false);
          expect(Value.meta.areEqual(undefined, va)).toBe(false);
          expect(Value.meta.areEqual(va, undefined)).toBe(false);
          expect(Value.meta.areEqual(va, null)).toBe(false);
        });

        it("should return `true` when given the same value instances and not call its #equals method", function() {
          var va = new Value();

          spyOn(va, "equals").and.callThrough();

          expect(Value.meta.areEqual(va, va)).toBe(true);
          expect(va.equals).not.toHaveBeenCalled();
        });

        it("should return `false` when given values with different constructors and not call their #equals methods",
        function() {
          var va = new Value();
          var vb = new Number(1);

          spyOn(va, "equals").and.callThrough();
          spyOn(vb, "equals").and.callThrough();

          expect(Value.meta.areEqual(va, vb)).toBe(false);

          expect(va.equals).not.toHaveBeenCalled();
          expect(vb.equals).not.toHaveBeenCalled();
        });

        it("should call the first value's #equals method when these are distinct instances with the same constructor",
            function() {
          var va = new Value();
          var vb = new Value();

          spyOn(va, "equals").and.callFake(function() { return false; });
          spyOn(vb, "equals").and.callFake(function() { return false; });

          expect(Value.meta.areEqual(va, vb)).toBe(false);

          expect(va.equals).toHaveBeenCalled();
          expect(vb.equals).not.toHaveBeenCalled();
        });
      }); // end #areEqual

      describe("#create(valueSpec, {defaultType: .})", function() {

        it("should return an instance when given nully", function() {
          var Complex = myContext.get("pentaho/type/complex");
          var MyComplex = Complex.extend();
          var inst = MyComplex.meta.create(null);
          expect(inst instanceof MyComplex).toBe(true);

          inst = MyComplex.meta.create(undefined);
          expect(inst instanceof MyComplex).toBe(true);
        });

        it("should create an instance given a number value when called on a Number type", function() {
          var Number = myContext.get("pentaho/type/number");
          var number = Number.meta.create(1);

          expect(number instanceof Number).toBe(true);
          expect(number.value).toBe(1);
        });

        it("should create an instance given a number value when called on Number", function() {
          var Number = myContext.get("pentaho/type/number");
          var number = Number.meta.create(1);

          expect(number instanceof Number).toBe(true);
          expect(number.value).toBe(1);
        });

        it("should create an instance given a boolean value when called on Boolean", function() {
          var Boolean = myContext.get("pentaho/type/boolean");
          var value = Boolean.meta.create(true);

          expect(value instanceof Boolean).toBe(true);
          expect(value.value).toBe(true);
        });

        it("should create an instance given an object value when called on Object", function() {
          var Object = myContext.get("pentaho/type/object");
          var primitive = {};
          var value = Object.meta.create({v: primitive});

          expect(value instanceof Object).toBe(true);
          expect(value.value).toBe(primitive);
        });

        it("should create an instance given an object with a type annotation, '_'", function() {
          var value = Value.meta.create({_: "pentaho/type/number", v: 1});

          var Number = myContext.get("pentaho/type/number");
          expect(value instanceof Number).toBe(true);
          expect(value.value).toBe(1);
        });

        it("should throw if given a type-annotated value that does not extend from the this type", function() {
          var String = myContext.get("pentaho/type/string");

          expect(function() {
            String.meta.create({_: "pentaho/type/number", v: 1});
          }).toThrowError(
              error.operInvalid(
                  bundle.format(
                      bundle.structured.errors.value.notOfExpectedBaseType, ["pentaho/type/string"])).message);
        });

        it("should not throw if given a type-annotated value that does extend from the given baseType", function() {
          var Simple = myContext.get("pentaho/type/simple");
          var Number = myContext.get("pentaho/type/number");

          var value = Simple.meta.create({_: "pentaho/type/number", v: 1});

          expect(value instanceof Number).toBe(true);
          expect(value.value).toBe(1);
        });

        it("should throw if given a type annotated value of an abstract type", function() {
          var MyAbstract = myContext.get("pentaho/type/complex").extend({meta: {abstract: true}});

          expect(function() {
            Value.meta.create({_: MyAbstract});
          }).toThrowError(
              error.operInvalid(
                  bundle.format(
                      bundle.structured.errors.value.cannotCreateInstanceOfAbstractType, ["Complex"])).message);
        });

        it("should throw if given a value and called on an abstract type", function() {
          var MyAbstract = myContext.get("pentaho/type/complex").extend({meta: {abstract: true}});

          expect(function() {
            MyAbstract.meta.create({});
          }).toThrowError(
              error.operInvalid(
                  bundle.format(
                      bundle.structured.errors.value.cannotCreateInstanceOfAbstractType, ["Complex"])).message);
        });

        // ---

        it("should be able to create a type-annotated value of a list type", function() {
          var NumberList = myContext.get({base: "list", of: "number"});

          var value = Value.meta.create({_: NumberList, d: [1, 2]});

          expect(value instanceof NumberList).toBe(true);
          expect(value.count).toBe(2);
          expect(value.at(0).value).toBe(1);
          expect(value.at(1).value).toBe(2);
        });

        it("should be able to create a type-annotated value of an inline list type", function() {
          var value = Value.meta.create({
            _: {base: "list", of: "number"},
            d: [1, 2]
          });

          expect(value instanceof myContext.get("list")).toBe(true);
          expect(value.count).toBe(2);
          expect(value.at(0).value).toBe(1);
          expect(value.at(1).value).toBe(2);
        });

        it("should be able to create a type-annotated value of an inline complex type", function() {
          var value = Value.meta.create({
            _: {
              props: ["a", "b"]
            },
            "a": 1,
            "b": 2
          });

          expect(value instanceof myContext.get("complex")).toBe(true);
          expect(value.get("a").value).toBe("1");
          expect(value.get("b").value).toBe("2");
        });

        it("should be able to create a type-annotated value of an inline list complex type", function() {
          var value = Value.meta.create({
            _: [
              {
                props: [
                  {name: "a"},
                  "b"
                ]
              }
            ],
            d: [
              {a: 1, b: 2}
            ]
          });

          expect(value instanceof myContext.get("list")).toBe(true);
          expect(value.count).toBe(1);
        });

        it("should be able to create a type-annotated value of an inline list complex type in array form", function() {
          var value = Value.meta.create({
            _: [{
              props: ["a", "b"]
            }],
            d: [
              [1, 2],
              [3, 4]
            ]
          });

          expect(value instanceof myContext.get("list")).toBe(true);
          expect(value.count).toBe(2);
        });

      }); // #create
    }); // "Meta"

    describe(".extend({...}) returns a value that -", function() {

      it("should be a function", function() {
        var Derived = Value.extend();
        expect(typeof Derived).toBe("function");
      });

      it("should be a sub-class of Value", function() {
        var Derived = Value.extend();
        expect(Derived).not.toBe(Value);
        expect(Derived.prototype instanceof Value).toBe(true);
      });

      describe("has a .Meta property that -", function() {

        it("should be a function", function() {
          var Derived = Value.extend();
          expect(typeof Derived.Meta).toBe("function");
        });

        it("should be a sub-class of Value.Meta", function() {
          var Derived = Value.extend();
          expect(Derived.Meta).not.toBe(Value.Meta);
          expect(Derived.meta instanceof Value.Meta).toBe(true);
        });

        describe("#abstract", function() {
          it("should respect a specified abstract spec value", function() {
            var Derived = Value.extend({meta: {abstract: true}});
            expect(Derived.meta.abstract).toBe(true);

            Derived = Value.extend({meta: {abstract: false}});
            expect(Derived.meta.abstract).toBe(false);
          });

          it("should default to `false` whe spec is unspecified and should not inherit the base value", function() {
            var Derived = Value.extend();
            expect(Derived.meta.abstract).toBe(false);

            var Abstract = Value.extend({meta: {abstract: true }});
            var Concrete = Value.extend({meta: {abstract: false}});

            var DerivedAbstract = Abstract.extend();
            var DerivedConcrete = Concrete.extend();

            expect(DerivedAbstract.meta.abstract).toBe(false);
            expect(DerivedConcrete.meta.abstract).toBe(false);
          });

          it("should respect a set non-nully value", function() {
            var Derived = Value.extend();
            expect(Derived.meta.abstract).toBe(false);

            Derived.meta.abstract = true;
            expect(Derived.meta.abstract).toBe(true);

            Derived.meta.abstract = false;
            expect(Derived.meta.abstract).toBe(false);
          });

          it("should set to the default value false when set to a nully value", function() {
            var Derived = Value.extend({meta: {abstract: true}});
            expect(Derived.meta.abstract).toBe(true);
            Derived.meta.abstract = null;
            expect(Derived.meta.abstract).toBe(false);

            Derived = Value.extend({meta: {abstract: true}});
            expect(Derived.meta.abstract).toBe(true);
            Derived.meta.abstract = undefined;
            expect(Derived.meta.abstract).toBe(false);
          });
        }); // #abstract
      });

    }); // .extend({...})

    describe("#key", function() {
      it("should return the result of toString()", function() {
        var va = new Value();

        spyOn(va, "toString").and.returnValue("FOOO");

        expect(va.key).toBe("FOOO");
        expect(va.toString).toHaveBeenCalled();
      });
    });// end #key

    describe("#equals", function() {
      it("should return `true` if given the same value", function() {
        var va = new Value();

        expect(va.equals(va)).toBe(true);
      });

      it("should return `true` if two distinct values have the same key", function() {
        var va = new Value(),
            vb = new Value();

        // Override/Redefine getter property
        Object.defineProperty(va, "key", {value: "A"});
        Object.defineProperty(vb, "key", {value: "A"});

        expect(va.equals(vb)).toBe(true);
      });

      it("should return `false` if two distinct values have different keys", function() {
        var va = new Value(),
            vb = new Value();

        // Override/Redefine getter property
        Object.defineProperty(va, "key", {value: "A"});
        Object.defineProperty(vb, "key", {value: "B"});

        expect(va.equals(vb)).toBe(false);
      });
    }); // end #equals
  });
});
