/*
 Copyright 2021 Esri

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
 * AdobeAnalyticsUtils
 *  - Adobe Analytics Utilities
 *
 * Author:   John Grayson - Applications Prototype Lab - Esri
 * Created:  9/27/2021 - 0.0.1 -
 * Modified:
 *
 */

class AdobeAnalyticsUtils {

  /**
   *
   * @type {string}
   */
  static version = '0.0.1';

  /**
   *
   * @type {{pageType: string, pagePath: string, [pageTitle]: string, [pageName]: string}}
   * @private
   */
  _dataLayer = {
    pageType: 'esri-geoxc-apl-demo',
    pagePath: window.location.pathname
  }

  /**
   *
   * @param {Watchable} source
   */
  constructor({source}) {

    // CONDITIONALLY LOAD MTAGS //
    if (window.location.origin.toLowerCase().endsWith('.esri.com')) {
      // IF URL ORIGINATES FROM esri.com //

      // ADOBE ANALYTICS TAGS //
      const scriptTag = document.createElement('script');
      scriptTag.src = 'https://mtags.esri.com/tags.js';
      document.head.appendChild(scriptTag);

      // WATCH FOR NAME AND TITLE CHANGES TO APPLICATION //
      source.watch('name', name => {
        this.update({pageName: name});
      });
      source.watch('title', title => {
        this.update({pageTitle: title});
      });

    } else {
      console.warn("mtags not loaded: url not originating from esri.com...");
    }

  }

  /**
   *
   * @param {Object} dataLayer
   */
  update(dataLayer) {
    //
    // DATA LAYER//
    //
    window.dataLayer = this._dataLayer = {...this._dataLayer, ...dataLayer};
  }

}

export default AdobeAnalyticsUtils;
