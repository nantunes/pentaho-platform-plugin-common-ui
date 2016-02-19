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
define(["pentaho/visual/editor/utils"], function(singletonEditorUtils) {

  function MapEditorProps(editorTypeId, dict) {
    this.editorTypeId = editorTypeId;

    this.get = function(p) {
      return dict.hasOwnProperty(p) ? dict[p] : null;
    };

    this.forEach = function(f, x) {
      for(var p in dict)
        if(dict.hasOwnproperty(p))
          f.call(x, p);
    };
  }

  function EditModel(dict) {

    this.byId = function(id) {
      var item = {};
      item.id = id;
      item.value = dict[id];
      return item;
    };
  }

  describe("Visual Editor Utils -", function() {

    describe("#getEditorProperties(type, editorDoc, filterPropsList)", function() {
      it("should be a function", function() {
        expect(typeof singletonEditorUtils.getEditorProperties).toBe("function");
      });

      it("should throw if `type` is not specified", function() {
        expect(function() {
          singletonEditorUtils.getEditorProperties();
        }).toThrow();
      });

      it("should throw if `editorDoc` is not specified", function() {
        expect(function() {
          singletonEditorUtils.getEditorProperties({});
        }).toThrow();
      });

      describe("type/config specifies `getEditorProperties`", function() {
        it("should call `getEditorProperties` with `type` as `this` JS context", function() {
          var type = {
            id: "ccc_bar",
            getEditorProperties: function() {}
          };

          var editorDoc = {type: "analyzer"};

          spyOn(type, "getEditorProperties");

          singletonEditorUtils.getEditorProperties(type, editorDoc);

          expect(type.getEditorProperties).toHaveBeenCalled();
          expect(type.getEditorProperties.calls.first().object).toBe(type);
        });

        it("should call `getEditorProperties` with all the expected arguments", function() {
          var type = {
            id: "ccc_bar",
            getEditorProperties: function() {}
          };

          var editorDoc = {editorTypeId: "analyzer"};
          var filterPropsList = ["foo", "bar"];

          spyOn(type, "getEditorProperties");

          singletonEditorUtils.getEditorProperties(type, editorDoc, filterPropsList);

          expect(type.getEditorProperties).toHaveBeenCalled();

          var call = type.getEditorProperties.calls.first();

          expect(call.args.length).toBe(3);

          expect(call.args[0]).toBe(editorDoc);
          expect(call.args[1]).toBe(filterPropsList);

          var filterPropsMap = call.args[2];
          expect(filterPropsMap instanceof Object).toBe(true);
          filterPropsList.forEach(function(p) {
            expect(filterPropsMap[p]).toBe(true);
          });
        });

        it("should return an empty object if `getEditorProperties` returns nully", function() {
          var type = {
            id: "ccc_bar",
            getEditorProperties: function() {}
          };

          var editorDoc = {editorTypeId: "analyzer"};

          var result = singletonEditorUtils.getEditorProperties(type, editorDoc);

          expect(result).toEqual({});
        });

        it("should filter the result of `getEditorProperties` to respect `filterPropsList`", function() {
          var type = {
            id: "ccc_bar",
            getEditorProperties: function() { return {"foo": 1, "bar": 2, "dudu": 3}; }
          };

          var editorDoc = {editorTypeId: "analyzer"};
          var filterPropsList = ["foo", "bar"];

          var result = singletonEditorUtils.getEditorProperties(type, editorDoc, filterPropsList);

          expect(result.foo).toBe(1);
          expect(result.bar).toBe(2);
          expect("dudu" in result).toBe(false);
        });
      });

      describe("type/config does not specify getEditorProperties", function() {

        it("should copy defined editor props that have the name of a general data req", function() {
          var type = {
              id: "ccc_bar",
              dataReqs: [{reqs: [
                {id: "zas", dataStructure: "row"},
                {id: "foo"},
                {id: "bar"}
              ]}]
            };
          var editorDoc = new MapEditorProps("analyzer", {
              foo: 1,
              bar: undefined,
              zas: 3
            });

          var visualProps = singletonEditorUtils.getEditorProperties(type, editorDoc);

          expect(visualProps instanceof Object).toBe(true);
          expect(visualProps.foo).toBe(1);
          expect('bar' in visualProps).toBe(false);
          expect('zas' in visualProps).toBe(false);
        });

        it("should only include properties in `filterPropsList`, when specified", function() {
          var type = {
              id: "ccc_bar",
              dataReqs: [{reqs: [
                {id: "zas"},
                {id: "foo"},
                {id: "bar"}
              ]}]
            };
          var editorDoc = new MapEditorProps("analyzer", {
              foo: 1,
              bar: 2,
              zas: 3
            });
          var filterPropsList = ["foo", "zas"];

          var visualProps = singletonEditorUtils.getEditorProperties(type, editorDoc, filterPropsList);

          expect(visualProps instanceof Object).toBe(true);
          expect(visualProps.foo).toBe(1);
          expect("bar" in visualProps).toBe(false);
          expect(visualProps.zas).toBe(3);
        });
      });
    });

    describe("#processEditModelChange(type, spec, editModel, changedProp)", function() {
      it("should be a function", function() {
        expect(typeof singletonEditorUtils.processEditModelChange).toBe("function");
      });

      it("should throw if `type` is not specified", function() {
        expect(function() {
          singletonEditorUtils.processEditModelChange();
        }).toThrow();
      });

      it("should throw if `spec` is not specified", function() {
        expect(function() {
          singletonEditorUtils.processEditModelChange({});
        }).toThrow();
      });

      it("should throw if `editModel` is not specified", function() {
        expect(function() {
          singletonEditorUtils.processEditModelChange({}, {});
        }).toThrow();
      });

      it("should return `undefined`", function() {
        var type = {
              id: "ccc_bar"
            };
        var spec = {
              type: "ccc_bar"
            };

        var editModel = {};
        var result = singletonEditorUtils.processEditModelChange(type, spec, editModel);

        expect(result).toBe(undefined);
      });

      it("should call `type.updateEditModel` if it is implemented", function() {
        var type = {
              id: "ccc_bar",
              updateEditModel: function() {}
            };

        var spec = {
              type: "ccc_bar"
            };

        var editModel = {
            };

        var changedProp = "foo";

        spyOn(type, "updateEditModel");

        singletonEditorUtils.processEditModelChange(type, spec, editModel, changedProp);

        expect(type.updateEditModel).toHaveBeenCalled();
        expect(type.updateEditModel).toHaveBeenCalledWith(editModel, changedProp);
        expect(type.updateEditModel.calls.first().object).toBe(type);
      });

      it("should store `editModel` changes, for general requirements, in the `spec`", function() {
        var type = {
              id: "ccc_bar",
              dataReqs: [{reqs: [
                {id: "zas"},
                {id: "foo"},
                {id: "bar"}
              ]}]
            };

        var spec = {
              type: "ccc_bar"
            };

        var editModel = new EditModel({
              foo: 1,
              bar: 2,
              zas: 3
            });

        singletonEditorUtils.processEditModelChange(type, spec, editModel);

        expect(spec.foo).toBe(1);
        expect(spec.bar).toBe(2);
        expect(spec.zas).toBe(3);
      });
    });

    describe("#validateEditModel(type, editModel)", function() {
      it("should be a function", function() {
        expect(typeof singletonEditorUtils.validateEditModel).toBe("function");
      });

      it("should throw if `type` is not specified", function() {
        expect(function() {
          singletonEditorUtils.validateEditModel(undefined, {});
        }).toThrow();
      });

      it("should throw if `editModel` is not specified", function() {
        expect(function() {
          singletonEditorUtils.validateEditModel({});
        }).toThrow();
      });

      it("should validate 'required' visual role requirements", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", required: true, value: []}
          ]}]
        };

        var items = {
          zas: type.dataReqs[0].reqs[0]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors instanceof Array).toBe(true);
        expect(errors.length).toBe(1);
        expect(errors[0] instanceof Error).toBe(true);
        expect(errors[0].code).toBe("minOccur");
        expect(errors[0].reqs).toEqual(["zas"]);
        expect(errors[0].minOccur).toBe(1);
      });

      it("should not be 'required' by default", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", value: []}
          ]}]
        };

        var items = {
          zas: type.dataReqs[0].reqs[0]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors).toBe(null);
      });

      it("should validate 'minOccur' invalid visual role requirements", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", minOccur: 1, value: []},
            {id: "bar", dataStructure: "col", minOccur: 2, value: ["A"]}
          ]}]
        };

        var items = {
          zas: type.dataReqs[0].reqs[0],
          bar: type.dataReqs[0].reqs[1]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors instanceof Array).toBe(true);
        expect(errors.length).toBe(2);

        expect(errors[0] instanceof Error).toBe(true);
        expect(errors[0].code).toBe("minOccur");
        expect(errors[0].reqs).toEqual(["zas"]);
        expect(errors[0].minOccur).toBe(1);

        expect(errors[1] instanceof Error).toBe(true);
        expect(errors[1].code).toBe("minOccur");
        expect(errors[1].reqs).toEqual(["bar"]);
        expect(errors[1].minOccur).toBe(2);
      });

      it("should validate 'minOccur' valid visual role requirements", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", minOccur: 1, value: ["A"]},
            {id: "bar", dataStructure: "col", minOccur: 2, value: ["A", "B", "C"]}
          ]}]
        };

        var items = {
          zas: type.dataReqs[0].reqs[0],
          bar: type.dataReqs[0].reqs[1]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors).toBe(null);
      });

      it("should validate 'allowMultiple:false' visual role requirements", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", allowMultiple: false, value: ["A", "B"]}
          ]}]
        };

        var items = {
          zas: type.dataReqs[0].reqs[0]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors instanceof Array).toBe(true);
        expect(errors.length).toBe(1);
        expect(errors[0] instanceof Error).toBe(true);
        expect(errors[0].code).toBe("maxOccur");
        expect(errors[0].reqs).toEqual(["zas"]);
        expect(errors[0].maxOccur).toBe(1);
      });

      it("should validate 'allowMultiple:true' visual role requirement", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", allowMultiple: true, value: ["A", "B"]}
          ]}]
        };

        var items = {
          zas: type.dataReqs[0].reqs[0]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors).toBe(null);
      });

      it("should allow multiple by default", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", value: ["A", "B"]}
          ]}]
        };

        var items = {
          zas: type.dataReqs[0].reqs[0]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors).toBe(null);
      });

      it("should validate 'maxOccur' invalid visual role requirement", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", maxOccur: 1, value: ["A", "B"]},
            {id: "bar", dataStructure: "row", maxOccur: 2, value: ["A", "B", "C"]}
          ]}]
        };

        var items = {
          zas: type.dataReqs[0].reqs[0],
          bar: type.dataReqs[0].reqs[1]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors instanceof Array).toBe(true);
        expect(errors.length).toBe(2);

        expect(errors[0] instanceof Error).toBe(true);
        expect(errors[0].code).toBe("maxOccur");
        expect(errors[0].reqs).toEqual(["zas"]);
        expect(errors[0].maxOccur).toBe(1);

        expect(errors[1] instanceof Error).toBe(true);
        expect(errors[1].code).toBe("maxOccur");
        expect(errors[1].reqs).toEqual(["bar"]);
        expect(errors[1].maxOccur).toBe(2);
      });

      it("should validate 'maxOccur' valid visual role requirement", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", maxOccur: 1, value: []},
            {id: "bar", dataStructure: "row", maxOccur: 2, value: ["A", "B"]}
          ]}]
        };

        var items = {
          zas: type.dataReqs[0].reqs[0],
          bar: type.dataReqs[0].reqs[1]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors).toBe(null);
      });

      it("should not call `type.validateEditModel` if basic validation fails", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", required: true, value: []} // invalid
          ]}],
          validateEditModel: jasmine.createSpy("validateEditModel")
        };

        var items = {
          zas: type.dataReqs[0].reqs[0]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(!!errors).toBe(true);

        expect(type.validateEditModel).not.toHaveBeenCalled();
      });

      it("should call `type.validateEditModel` if basic validation succeeds", function() {
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", value: []} // invalid
          ]}],
          validateEditModel: jasmine.createSpy("validateEditModel")
        };

        var items = {
          zas: type.dataReqs[0].reqs[0]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors = singletonEditorUtils.validateEditModel(type, editModel);

        expect(!!errors).toBe(false);

        expect(type.validateEditModel).toHaveBeenCalledWith(editModel);
        expect(type.validateEditModel.calls.first().object).toBe(type);
      });

      it("should return the errors returned by `type.validateEditModel`", function() {
        var errors = [new Error()];
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", value: []} // invalid
          ]}],
          validateEditModel: jasmine.createSpy("validateEditModel").and.returnValue(errors)
        };

        var items = {
          zas: type.dataReqs[0].reqs[0]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors2 = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors2).toBe(errors);
      });

      it("should normalize an empty errors array returned by `type.validateEditModel` to null", function() {
        var errors = [];
        var type = {
          id: "ccc_bar",
          dataReqs: [{reqs: [
            {id: "zas", dataStructure: "row", value: []} // invalid
          ]}],
          validateEditModel: jasmine.createSpy("validateEditModel").and.returnValue(errors)
        };

        var items = {
          zas: type.dataReqs[0].reqs[0]
        };

        var editModel = {
          byId: function(name) { return items[name]; }
        };

        var errors2 = singletonEditorUtils.validateEditModel(type, editModel);

        expect(errors2).toBe(null);
      });
    });
  });
});
