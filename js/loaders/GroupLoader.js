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

import Watchable from "../support/Watchable.js";

/**
 * https://developers.arcgis.com/rest/users-groups-and-items/search-reference.htm
 */

class GroupLoader extends Watchable {
  
  _groupId;
  
  _group;
  get group() {
    return this._group;
  }
  
  constructor(config, portal) {
    super();
    
    // GROUP ID //
    this._groupId = config.group;
    if (this._groupId) {
      portal.queryGroups({query: `(id:${this._groupId})`, num: 1}).then(queryResponse => {
        if (queryResponse.results.length) {
          this._group = queryResponse.results[0];
        } else {
          console.error(new Error("Can't find configured group."));
        }
      });
    }
    
  }
  
  loadGroup() {
    return new Promise((resolve, reject) => {
      if (this._groupId) {
        this.watch('_group', group => {
          resolve(group);
        });
      } else {
        reject(new Error('No configured Group id.'));
      }
    });
  }
  
}

GroupLoader.hasGroup = (config) => {
  return ((config.group != null) && config.group.length);
};

export default GroupLoader;
