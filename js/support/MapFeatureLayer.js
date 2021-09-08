/*
 Copyright 2020 Esri

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import Watchable from "./Watchable.js";

/**
 *
 * MapFeatureLayer
 *  - Map Feature Layer
 *
 * Author:   John Grayson - Applications Prototype Lab - Esri
 * Created:  6/9/2021 - 0.0.1 -
 * Modified:
 *
 */

class MapFeatureLayer extends Watchable {

  featureLayer;
  objectIdField;
  featureLayerView;
  filter;
  features;

  _featuresByOID = new Map();

  constructor({view, title, filter}) {
    super();

    this.filter = filter || {};

    this.featureLayer = view.map.layers.find(layer => { return (layer.title === title); });
    if (this.featureLayer) {
      // LOAD //
      this.featureLayer.load().then(() => {
        // FIELDS //
        this.featureLayer.set({outFields: this.filter.outFields || ["*"]});
        // OBJECTID FIELD //
        this.objectIdField = this.featureLayer.objectIdField;
        // GET FEATURES //
        this.getAllFeatures().then(() => {
          // WAIT FOR FEATURELAYERVIEW //
          view.whenLayerView(this.featureLayer).then(featureLayerView => {
            // FEATURELAYERVIEW //
            this.featureLayerView = featureLayerView;
          });
        });
      });
    }
  }

  /**
   *
   * @param oid
   * @returns {Graphic}
   */
  getFeature(oid) {
    return this._featuresByOID.get(oid);
  }

  /**
   *
   * @param feature
   * @returns {String}
   */
  getLabel(feature) {
    return feature.attributes[this.objectIdField];
  }

  /**
   *
   * @param feature
   * @returns {String}
   */
  getDescription(feature) {
    return feature.attributes[this.objectIdField];
  }

  /**
   *
   * @returns {Promise}
   */
  getAllFeatures() {
    return new Promise((resolve, reject) => {
      this.getFeatures().then(features => {
        // FEATURES //
        this.features = features;
        resolve();
      }).catch(reject);
    });
  }

  /**
   *
   * @returns {Promise}
   */
  getFeatures(filter = {}) {
    return new Promise((resolve, reject) => {
      const featuresQuery = this.featureLayer.createQuery();
      featuresQuery.set({
        where: featuresQuery.where || '1=1',
        returnGeometry: true,
        ...this.filter,
        ...filter
      });
      this.featureLayer.queryFeatures(featuresQuery).then(featuresFS => {
        // FEATURE BY OID //
        this._featuresByOID = featuresFS.features.reduce((list, feature) => {
          return list.set(feature.attributes[this.objectIdField], feature);
        }, new Map());
        resolve(featuresFS.features);
      }).catch(reject);
    });
  }

  /**
   *
   * @returns {Promise}
   */
  load() {
    return new Promise((resolve, reject) => {
      this.watch('featureLayerView', featureLayerView => {
        if (featureLayerView != null) {
          resolve();
        }
      });
    });
  }

}

export default MapFeatureLayer;
