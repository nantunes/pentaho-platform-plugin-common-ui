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
  "pentaho/type/complex",
  "pentaho/util/error",
  "pentaho/i18n!type"
], function(complexFactory, error, bundle) {

  "use strict";

  /**
   * Creates the `Model` type of a given context.
   *
   * @name modelFactory
   * @memberOf pentaho.visual.base
   * @type pentaho.type.Factory.<pentaho.visual.base.Model>
   * @amd pentaho/visual/base/modelFactory
   */
  return function(context) {

    var Complex = context.get(complexFactory);


    /**
     * @name Model
     * @memberOf pentaho.visual.base
     * @class
     * @extends pentaho.type.Complex
     * @abstract
     * @classDesc This is the base model class for visualizations.
     *
     * @constructor
     * @description Creates a base `Model`.
     * @param {pentaho.visual.base.spec.IModel} modelSpec A plain object containing the model specification.
     */
    var Model = Complex.extend({
          meta: {
            id: "pentaho/visual/base",
            view: "View",
            "abstract": true,
            props: [
              {
                name: "width",
                type: "number",
                required: true
              },
              {
                name: "height",
                type: "number",
                required: true
              },
              {
                name: "interactive",
                type: "boolean",
                value: true
              },
              {
                name: "data",
                type: "object",
                required: true
              }
            ]
          }
        })
        .implement({meta: bundle.structured});

    return Model;
  };
});
