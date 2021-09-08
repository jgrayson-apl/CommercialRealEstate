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

class MapLoader extends Watchable {
  
  // PORTAL ITEM ID //
  id;
  // MAP //
  map;
  get map() {
    return this.map;
  }
  
  constructor(config) {
    super();
    
    this.id = (config.webmap || config.webscene);
    
    if (config.webmap) {
      require(['esri/WebMap'], WebMap => {
        this.map = new WebMap({portalItem: {id: this.id}});
      });
    }
    
    if (config.webscene) {
      require(['esri/WebScene'], WebScene => {
        this.map = new WebScene({portalItem: {id: this.id}});
      });
    }
    
    //
    // TODO: DO WE CREATE A DEFAULT MAP?
    //
    
  }
  
  loadMap() {
    return new Promise((resolve, reject) => {
      if (this.id) {
        this.watch('map', map => {
          map.loadAll().then(() => {
            resolve(map);
          }).catch(error => {
            reject(error || new Error('Error loading Map'));
          });
        });
      } else {
        reject(new Error('No configured WebMap or WebScene id.'));
      }
    });
  }
  
}

MapLoader.hasMap = (config) => {
  return ((config.webmap != null) && config.webmap.length) || ((config.webscene != null) && config.webscene.length);
};

export default MapLoader;
