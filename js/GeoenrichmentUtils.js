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

/**
 *
 * GeoenrichmentUtils
 *  - Geoenriched Location
 *
 * Author:   John Grayson - Applications Prototype Lab - Esri
 * Created:  8/23/2021 - 0.0.1 -
 * Modified:
 *
 * https://developers.arcgis.com/documentation/mapping-apis-and-services/demographics/
 *
 * https://developers.arcgis.com/rest/geoenrichment/api-reference/geoenrichment-service-overview.htm
 * https://developers.arcgis.com/rest/geoenrichment/api-reference/enrich.htm
 *
 * https://developers.arcgis.com/python/guide/performing-geoenrichment/
 *
 */

class GeoenrichmentUtils {

  // AUTHENTICATION //
  _authentication;

  /**
   *
   */
  constructor() {
    require(['esri/config'], (esriConfig) => {
      if (esriConfig.apiKey != null) {
        if (arcgisRest != null) {

          // AUTHENTICATION //
          this._authentication = new arcgisRest.ApiKey({key: esriConfig.apiKey});

        } else { throw new Error('ArcGIS REST API not available or configured correctly.'); }
      } else { throw new Error('No configured API Key.'); }
    });
  }

  /**
   *
   * @param {Graphic} siteFeature
   * @param {CandidateSite} candidateSite
   * @returns {Promise<{geometry, attributes}>}
   */
  queryDemographicData({siteFeature, candidateSite}) {
    return new Promise((resolve, reject) => {
      if (this._authentication) {

        // SITE LOCATION //
        const location = siteFeature.geometry;

        // GEOENRICH LOCAITON //
        arcgisRest.queryDemographicData({
          authentication: this._authentication,
          analysisVariables: candidateSite.analysisVariables,
          studyAreas: [{"geometry": {"x": location.longitude, "y": location.latitude}}],
          params: {"studyAreasOptions": JSON.stringify(candidateSite.studyAreasOptions)},
          returnGeometry: true
        }).then((response) => {
          const resultFSs = response.results[0].value.FeatureSet;
          if ((resultFSs.length > 0) && (resultFSs[0].features.length > 0)) {

            resolve(resultFSs[0].features[0]);

          } else { reject(new Error("No data found.")); }
        }).catch(reject);
      } else {
        reject(new Error("Not authenticated so we can't to use the GeoEnrichment service."));
      }
    });
  }

}

export default GeoenrichmentUtils;
