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

class ViewLoader extends Watchable {

  // VIEW PROPERTIES //
  _viewProperties;

  constructor(viewProperties) {
    super();
    this._viewProperties = viewProperties;
  }

  loadView() {
    return new Promise((resolve, reject) => {

      const {map} = this._viewProperties;

      if (map.declaredClass === 'esri.WebMap') {
        require(['esri/views/MapView'], (MapView) => {
          const mapView = new MapView(this._viewProperties);
          mapView.when(resolve, reject);
        });
      }

      if (map.declaredClass === 'esri.WebScene') {
        require(['esri/views/SceneView'], (SceneView) => {
          const sceneView = new SceneView(this._viewProperties);
          sceneView.when(resolve, reject);
        });
      }

    });
  }

}

export default ViewLoader;
