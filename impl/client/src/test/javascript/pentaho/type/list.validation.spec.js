/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  describe("pentaho.type.List", function() {

    var context;
    var List;
    var PentahoNumber;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            List = context.get("pentaho/type/list");
            PentahoNumber = context.get("pentaho/type/number");
          })
          .then(done, done.fail);
    });

    describe("#validate() -", function() {

      it("should call #validate() on each of its elements", function() {

        var NumberList = List.extend({
          $type: {of: PentahoNumber}
        });

        var list = new NumberList([1, 2, 3]);

        spyOn(list.at(0), "validate").and.returnValue(true);
        spyOn(list.at(1), "validate").and.returnValue(true);
        spyOn(list.at(2), "validate").and.returnValue(true);

        list.validate();

        expect(list.at(0).validate).toHaveBeenCalledTimes(1);
        expect(list.at(1).validate).toHaveBeenCalledTimes(1);
        expect(list.at(2).validate).toHaveBeenCalledTimes(1);
      });
    });
  });
});
