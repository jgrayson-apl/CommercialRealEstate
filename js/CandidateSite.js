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

import CandidateSiteType from "./CandidateSiteType.js";

/**
 *
 * CandidateSite
 *  - Candidate Site
 *
 * Author:   John Grayson - Applications Prototype Lab - Esri
 * Created:  8/25/2021 - 0.0.1 -
 * Modified:
 *
 */

class CandidateSite extends EventTarget {

  /**
   *
   * @private {Object}
   */
  _UI;

  /**
   *
   * @type {{money: Intl.NumberFormat, rate: Intl.NumberFormat, count: Intl.NumberFormat, none: {format: function(*): *}}}
   * @private
   */
  _formatters = {
    'none': {format: (value) => value},
    'count': new Intl.NumberFormat('default', {minimumFractionDigits: 0, maximumFractionDigits: 0}),
    'rate': new Intl.NumberFormat('default', {style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1}),
    'money': new Intl.NumberFormat('default', {style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0})
  };

  /**
   *
   * {string}
   */
  siteType;

  /**
   *
   * @private {Symbol}
   */
  locationSymbol;

  /**
   * {Basemap}
   */
  siteBasemap;

  /**
   * {Graphic}
   */
  siteFeature;

  /**
   * {Object}
   */
  studyAreasOptions;

  /**
   * {Object[]}
   */
  analysisVariableInfos;

  /**
   * {String[]}
   */
  analysisVariables;

  /**
   *
   * @param {HTMLElement} parentContainer
   * @param {string} siteType
   * @param {Symbol} locationSymbol
   * @param {Basemap} siteBasemap
   */
  constructor({parentContainer, siteType, locationSymbol, siteBasemap}) {
    super();

    // LOCATION SYMBOL
    this.locationSymbol = locationSymbol || CandidateSite.LOCATION_SYMBOL;

    // BASEMAP //
    this.siteBasemap = siteBasemap;

    // SITE TYPE //
    this.siteType = siteType;

    // CANDIDATE SITE TYPE //
    const candidateSiteType = new CandidateSiteType({siteType});
    this.studyAreasOptions = candidateSiteType.studyAreasOptions;
    this.analysisVariableInfos = candidateSiteType.analysisVariableInfos;
    this.analysisVariables = candidateSiteType.analysisVariables;

    // BUILD UI //
    this._buildUI(parentContainer);
  }

  /**
   *
   * @param {HTMLElement} parentContainer
   * @private
   */
  _buildUI(parentContainer) {

    // TEMPLATE NODE //
    const templateNode = CandidateSite.TEMPLATE.content.cloneNode(true);

    // UI COMPONENTS //
    this.UI = {
      container: templateNode.querySelector('.geoenriched-container'),
      containerHeader: templateNode.querySelector('.geoenriched-container-header'),
      removeBtn: templateNode.querySelector('.remove-btn'),
      siteContainer: templateNode.querySelector('.site-container'),
      viewContainer: templateNode.querySelector('.view-container'),
      statsContainer: templateNode.querySelector('.stats-container')
    };

    // ADD THIS CANDIDATE SITE //
    parentContainer.prepend(this.UI.container);

    // REMOVE THIS CANDIDATE SITE //
    this.UI.removeBtn.addEventListener('click', () => {
      this.UI.container.remove();
      this.dispatchEvent(new CustomEvent('site-removed', {detail: {}}));
    });

  }

  /**
   *
   * @param {Graphic} siteFeature
   */
  displaySiteInfo(siteFeature) {

    // SITE FEATURE //
    this.siteFeature = siteFeature;

    // SITE DETAILS //
    const attributes = this.siteFeature.attributes;

    // HEADER SITE LABEL //
    this.UI.containerHeader.innerHTML = attributes.Location_Name;

    // ADDRESS PARTS //
    const addressParts = attributes.Address.split(',');

    // SITE INFORMATION //
    const siteInfoNodes = [
      this._dataRow('Address', 'location address', addressParts[0] || 'N/A'),
      this._dataRow('Place', 'location place', addressParts[1] || 'N/A'),
      this._dataRow('Site Type', 'type of commercial site', this.siteType || 'N/A'),
      //this._dataRow('Lease Type', 'type of lease available', attributes.Performance),
      this._dataRow('Size', 'available area', `${ this._formatters.count.format(attributes.SQFT) } sq/ft`),
      this._dataRow('Parking', 'available parking spots', attributes.Parking)
    ];

    this.UI.siteContainer.append(...siteInfoNodes);
  }

  /**
   *
   * @param {Error} error
   */
  displayError(error) {
    this.UI.statsContainer.innerHTML = JSON.stringify(error, null, 2);
  }

  /**
   *
   * @param {Geometry} geometry
   * @param {Object} attributes
   */
  displayResults({geometry, attributes}) {
    return new Promise((resolve, reject) => {
      require([
        'esri/Map',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/views/MapView'
      ], (EsriMap, Graphic, GraphicsLayer, MapView) => {

        // ICON //
        let icon = 'rings';

        // SEARCH AREA LABEL //
        let searchAreaLabel = 'Search Area: ';
        if (this.studyAreasOptions.areaType === "NetworkServiceArea") {
          icon = (this.studyAreasOptions.travel_mode === 'Walking') ? 'walking' : 'car';
          searchAreaLabel += `${ this.studyAreasOptions.bufferRadii[0] } ${ this.studyAreasOptions.bufferUnits } ${ this.studyAreasOptions.travel_mode } `;
        } else {
          searchAreaLabel += `${ this.studyAreasOptions.bufferRadii[0] } ${ this.studyAreasOptions.bufferUnits.replace(/esri/, '') }`;
        }

        // TITLE //
        const titleNode = this._dataTitle(searchAreaLabel, icon);

        // ANALYSIS VARIABLES DATA //
        const groupNodesList = this.analysisVariableInfos.reduce((list, avi) => {

          // GROUP NODE //
          let groupNode = list.get(avi.group) || this._dataGroup(avi.group);

          // DATA VALUE //
          const fieldInfo = avi.field.split('.');
          let dataValue = attributes[fieldInfo[1]];
          if (avi.format === 'rate') { dataValue /= 100.0 }

          // CHANGE VALUE //
          let dataChange = null;
          if (avi.compareTo) {
            const compareValue = attributes[avi.compareTo] || dataValue;
            dataChange = (dataValue - compareValue);
          }

          // DATA NODE //
          const dataNode = this._dataRow(avi.label, avi.description, this._formatters[avi.format].format(dataValue), dataChange);

          // ADD TO GROUP //
          groupNode.append(dataNode);

          return list.set(avi.group, groupNode);
        }, new Map());

        // UPDATE STATISTICS //
        this.UI.statsContainer.append(titleNode, ...groupNodesList.values());

        //
        // THE MAP //
        //

        // RESULT GRAPHICS & LAYER //
        const locationGraphic = new Graphic({
          symbol: this.locationSymbol,
          geometry: this.siteFeature.geometry
        });
        const resultGraphic = new Graphic({
          symbol: CandidateSite.RESULT_SYMBOL,
          geometry: {type: "polygon", rings: geometry.rings}
        });
        const resultsLayer = new GraphicsLayer({
          title: "Result Location",
          graphics: [resultGraphic, locationGraphic]
        });

        // RESULT MAP //
        const mapView = new MapView({
          container: this.UI.viewContainer,
          map: new EsriMap({
            basemap: this.siteBasemap,
            layers: [resultsLayer]
          }),
          ui: {components: []}
        });
        mapView.when(() => {
          mapView.goTo(resultGraphic).then(resolve).catch(reject);
        });
      });
    });
  }

  /**
   *
   * @param {string} title
   * @param {string} icon
   * @returns {HTMLElement}
   * @private
   */
  _dataTitle(title, icon = 'question-mark') {

    const titleNode = document.createElement('div');
    titleNode.classList.add('data-title');
    titleNode.innerHTML = title;

    const iconNode = document.createElement('calcite-icon');
    iconNode.setAttribute('icon', icon);
    iconNode.setAttribute('scale', 's');
    titleNode.prepend(iconNode);

    return titleNode;
  }

  /**
   *
   * @param {string} label
   * @returns {HTMLDivElement}
   * @private
   */
  _dataGroup(label) {

    const groupNode = document.createElement('div');
    groupNode.classList.add('data-group');

    const groupLabelNode = document.createElement('div');
    groupLabelNode.classList.add('data-group-label');
    groupLabelNode.innerHTML = label;

    groupNode.append(groupLabelNode);

    return groupNode;
  }

  /**
   *
   * @param {string} label
   * @param {string} description
   * @param {string} value
   * @param {number | null} [change]
   * @returns {HTMLDivElement}
   * @private
   */
  _dataRow(label, description, value, change) {

    const rowNode = document.createElement('div');
    rowNode.classList.add('data-row');
    rowNode.title = description;

    const dataLabelNode = document.createElement('div');
    dataLabelNode.classList.add('data-label');
    dataLabelNode.innerHTML = label;

    const dataValueNode = document.createElement('div');
    dataValueNode.classList.add('data-value');
    dataValueNode.innerHTML = value;

    if (change != null) {
      let icon = 'arrow-double-horizontal';
      if (change < 0.0) { icon = 'arrow-down'; }
      if (change > 0.0) { icon = 'arrow-up'; }

      const changeNode = document.createElement('calcite-icon');
      changeNode.setAttribute('icon', icon);
      changeNode.setAttribute('scale', 's');
      changeNode.classList.add('change-icon');
      dataValueNode.prepend(changeNode);
    }

    rowNode.append(dataLabelNode, dataValueNode);

    return rowNode;
  }

}

// ITEM TEMPLATE //
CandidateSite.TEMPLATE = document.getElementById('geoenriched-location-template');

//
// https://developers.arcgis.com/javascript/latest/visualization/symbols-color-ramps/esri-web-style-symbols-2d/
//
// LOCATION SYMBOL //
CandidateSite.LOCATION_SYMBOL = {
  type: "web-style",
  name: "esri-pin-2",
  styleName: "Esri2DPointSymbolsStyle"
};

// RESULT SYMBOL //
CandidateSite.RESULT_SYMBOL = {
  type: "simple-fill",
  color: 'transparent',
  outline: {
    color: "#995d36",
    width: 1.8
  }
};

export default CandidateSite;
