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

import GeoenrichmentUtils from "./GeoenrichmentUtils.js";
import CandidateSite from "./CandidateSite.js";
import Watchable from "./support/Watchable.js";

/**
 *
 * CandidateSites
 *  - Candidate Sites
 *
 * Author:   John Grayson - Applications Prototype Lab - Esri
 * Created:  8/25/2021 - 0.0.1 -
 * Modified:
 *
 */

class CandidateSites extends Watchable {

  /**
   *
   * @type {number}
   */
  static MAX_SITES_COUNT = 10;

  /**
   *
   * @private {Symbol}
   */
  _locationSymbol;

  /**
   *
   * @private {Basemap}
   */
  _basemap;

  /**
   *
   * @private {HTMLElement}
   */
  _parentContainer;

  /**
   *
   * @private {GeoenrichmentUtils}
   */
  _geoenrichmentUtils;

  /**
   *
   * @type {number}
   */
  sitesCount = 0;

  /**
   *
   * @type {boolean}
   */
  canAddSite = true;

  /**
   *
   * @param {HTMLElement} parentContainer
   * @param {Symbol} locationSymbol
   * @param {Basemap} basemap
   */
  constructor({parentContainer, locationSymbol, basemap}) {
    super();

    // LOCATION SYMBOL
    this._locationSymbol = locationSymbol;

    // BASEMAP //
    this._basemap = basemap;

    // PARENT CONTAINER //
    this._parentContainer = parentContainer;

    // GEOENRICHMENT UTILS //
    this._geoenrichmentUtils = new GeoenrichmentUtils();

  }

  /**
   *
   * @param {Graphic} siteFeature
   */
  displayCandidateSite({siteFeature}) {
    return new Promise((resolve, reject) => {

      // CANDIDATE SITE //
      const candidateSite = new CandidateSite({
        parentContainer: this._parentContainer,
        siteType: siteFeature.getAttribute('SiteType') || 'Retail',
        locationSymbol: this._locationSymbol.clone(),
        siteBasemap: this._basemap.clone()
      });

      // ADD TO SITE COUNT AND UPDATE CAN ADD SITE //
      this.canAddSite = (++this.sitesCount < CandidateSites.MAX_SITES_COUNT);
      candidateSite.addEventListener('site-removed', () => {
        // REMOVE FROM SITE COUNT AND UPDATE CAN ADD SITE //
        this.canAddSite = (--this.sitesCount < CandidateSites.MAX_SITES_COUNT);
      });

      // DISPLAY CANDIDATE SITE INFO //
      candidateSite.displaySiteInfo(siteFeature);

      // GEOENRICH SITE LOCATION //
      this._geoenrichmentUtils.queryDemographicData({siteFeature, candidateSite}).then(geoenrichmentResult => {

        // DISPLAY ANALYSIS RESULTS //
        candidateSite.displayResults(geoenrichmentResult).then(resolve).catch(reject)

      }).catch(error => {
        // DISPLAY ERROR //
        candidateSite.displayError(error);
        reject(error);
      });

    });
  }

}

export default CandidateSites;
