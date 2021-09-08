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
 * AppParameters
 *  - Application Parameters
 *
 * Author:   John Grayson - Applications Prototype Lab - Esri
 * Created:  5/7/2021 - 0.0.1 -
 * Modified:
 *
 */

import Watchable from "./Watchable.js";

class AppParameters extends Watchable {

  //
  // PATH TO DEFAULT CONFIG //
  //
  static DEFAULT_CONFIG_PATH = './config/application.json';

  // BASE URL //
  _baseUrl;

  // SHAREABLE PARAMETERS //
  shareable = [];

  /**
   *
   */
  constructor() {
    super();

    // BASE URL //
    this._baseUrl = encodeURI(`${ window.location.origin }${ window.location.pathname }`);

  }

  /**
   *
   * @param configPath
   * @returns {Promise<Object>}
   */
  async load(configPath) {
    return new Promise((resolve, reject) => {

      fetch(configPath || AppParameters.DEFAULT_CONFIG_PATH).then(res => {
        return res.ok
          ? res.json()
          : Promise.reject(`Error loading application configuration. HTTP status ${ res.status }: ${ res.statusText }`);
      }).then(config => {

        // CONFIG PARAMS //
        Object.assign(this, config);

        // URL PARAMS //
        const urlParameters = new URLSearchParams(window.location.search);
        urlParameters.forEach((value, key) => {
          this[key] = value;
          this.shareable.push(key);
        });

        resolve();
      }).catch(reject);

    });
  }

  /**
   *
   * @param name
   * @param value
   * @param shareable
   * @returns {*}
   */
  setParam(name, value, shareable) {
    this[name] = value;
    shareable && this.setSharable(name);
    return this.getParam(name);
  }

  /**
   *
   * @param name
   * @param formatter
   * @returns {*}
   */
  getParam(name, formatter) {
    const value = this[name];
    return (formatter && value) ? formatter(value) : value;
  }

  /**
   *
   * @param name
   */
  setSharable(name) {
    if ((!this.shareable.includes(name)) && (name in this)) {
      this.shareable.push(name);
    }
  }

  /**
   *
   * @returns {string}
   */
  toShareURL() {

    const urlParams = this.shareable.reduce((list, paramName) => {
      const paramValue = this.getParam(paramName);
      paramValue && list.set(paramName, paramValue);
      return list;
    }, new URLSearchParams());

    return (Array.from(urlParams.keys()).length > 0) ? `${ this._baseUrl }?${ urlParams.toString() }` : this._baseUrl;

  }

}

export default AppParameters;
