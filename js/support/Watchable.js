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

//
// TODO: MOVE LIST OF WATCHES TO SUPPORT MORE THAN ONE WATCH PER KEY
//

export default class Watchable {

  // WATCHES = MAP OF PROPERTY NAMES AND CHANGE HANDLERS //
  _watches;
  get watches() { return this._watches; }

  /**
   *
   * @returns {Watchable}
   */
  constructor() {

    // PROPERTY NAMES AND HANDLERS //
    this._watches = new Map();

    // PROXY //
    return new Proxy(this, {
      set(target, key, value) {
        if ((target[key] !== value) && target.watches.has(key)) {
          target[key] = value;
          target.watches.get(key)(value);
        }
        return Reflect.set(...arguments);
      }
    });
  }

  /**
   *
   * @param property {String}
   * @param handler {Function}
   * @returns {{remove: Function}}
   */
  watch(property, handler) {
    this._watches.set(property, handler);
    if (this[property] != null) {
      handler(this[property]);
    }
    return {
      remove: () => {
        this._watches.delete(property);
      }
    }
  }

}
