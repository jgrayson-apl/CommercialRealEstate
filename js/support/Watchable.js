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
 */
export default class Watchable {

  /**
   * INTERNAL MAP OF PROPERTY NAMES AND CHANGE HANDLERS
   *
   * @type {Map<string,Function[]>}
   * @private
   */
  _watchesByName;

  /**
   *  MAP OF PROPERTY NAMES AND CHANGE HANDLERS
   *
   * @returns {Map<string, Function[]>}
   */
  get watches() { return this._watchesByName; }

  /**
   *
   * @returns {Watchable}
   */
  constructor() {

    // PROPERTY NAMES AND HANDLERS //
    this._watchesByName = new Map();

    // PROXY //
    return new Proxy(this, {
      set(target, key, value) {
        if (target[key] !== value) {
          // SET VALUE //
          target[key] = value;
          // CALL WATCHES //
          const watches = target.watches.get(key);
          watches && watches.forEach(handler => handler(value));
        }
        return Reflect.set(...arguments);
      }
    });
  }

  /**
   * Start watching a property changes and if already set will call the handler.
   *
   * @param {string} property
   * @param {Function} handler
   */
  watch(property, handler) {

    // UPDATE PROPERTY HANDLERS //
    const watches = this._watchesByName.get(property) || [];
    watches.push(handler);
    this._watchesByName.set(property, watches);

    if (this[property] != null) {
      handler(this[property]);
    }
    /*return {
     remove: () => {
     this._watchesByName.delete(property);
     }
     }*/
  }

}
