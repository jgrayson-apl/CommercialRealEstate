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
import GroupLoader from "./GroupLoader.js";
import MapLoader from "./MapLoader.js";
import ViewLoader from "./ViewLoader.js";

class AppLoader extends Watchable {

  // APPLICATION //
  app;

  // PORTAL, GROUP, MAP, VIEW //
  portal;
  group;
  map;
  view;

  /**
   *
   */
  constructor({app}) {
    super();
    this.app = app;
  }

  /**
   *
   * @returns {Promise}
   */
  load() {
    return new Promise((resolve, reject) => {
      this._load().then((loadMessage) => {
        console.info(loadMessage);
        resolve({
          portal: this.portal,
          group: this.group,
          map: this.map,
          view: this.view
        });
      }).catch(reject);
    });
  }

  /**
   *
   * @private
   */
  _load() {
    return new Promise((resolve, reject) => {
      // ESRI CONFIG //
      require(['esri/config'], (esriConfig) => {

        // PORTAL URL //
        if (this.app?.portalUrl) {
          esriConfig.portalUrl = this.app.portalUrl;
        }

        //
        // API KEY //
        //
        if (this.app?.apiKey) {

          // CONFIGURE APIKEY //
          esriConfig.apiKey = this.app.apiKey;

          // LOAD PORTAL //
          this._loadPortal().then(() => {
            resolve(`Application created via API key. [ ${ (new Date()).toLocaleString() } ]`);
          }).catch(reject);

        } else {
          require(['esri/identity/IdentityManager'], (esriId) => {

            //
            // OAUTH //
            //
            if (this.app?.oauthappid) {
              require(['esri/identity/OAuthInfo'], (OAuthInfo) => {

                // CONFIGURE OAUTH //
                const oauthInfo = new OAuthInfo({appId: this.app.oauthappid, popup: true});
                esriId.registerOAuthInfos([oauthInfo]);
                esriId.checkSignInStatus(`${ esriConfig.portalUrl }/sharing`).then(() => {
                  /* ... */
                }).catch(() => {
                  /* ... */
                }).then(() => {
                  // LOAD PORTAL //
                  this._loadPortal({authMode: 'immediate'}).then(() => {
                    resolve(`Application created via OAuth. [ ${ (new Date()).toLocaleString() } ]`);
                  }).catch(reject);
                })

              });

            } else {
              //
              // NO CONFIGURED AUTHENTICATION //
              //
              // LOAD PORTAL //
              this._loadPortal().then(() => {
                resolve(`Application created on ${ (new Date()).toLocaleString() }`);
              }).catch(reject);
            }
          });
        }
      });

    });
  }

  /**
   *
   * @param params
   * @returns {Promise}
   * @private
   */
  _loadPortal(params = {}) {
    return new Promise((resolve, reject) => {
      require(['esri/portal/Portal'], (Portal) => {
        // CREATE PORTAL //
        const portal = new Portal({...params});
        // LOAD PORTAL //
        portal.load().then(() => {
          Promise.all([
            this._loadGroup(portal),
            this._loadMap()
          ]).then(() => {
            this.portal = portal;
            resolve();
          }).catch(reject);
        }).catch(reject);
      });
    });
  }

  /**
   *
   * @param portal
   * @returns {Promise}
   * @private
   */
  _loadGroup(portal) {
    return new Promise((resolve, reject) => {
      if (GroupLoader.hasGroup(this.app)) {
        // GROUP LOADER //
        const groupLoader = new GroupLoader(this.app, portal);
        groupLoader.loadGroup().then(group => {
          this.group = group;
          resolve();
        }).catch(reject);
      } else {
        resolve();
      }
    });
  }

  /**
   *
   * @returns {Promise}
   * @private
   */
  _loadMap() {
    return new Promise((resolve, reject) => {
      if (MapLoader.hasMap(this.app)) {
        // MAP LOADER //
        const mapLoader = new MapLoader(this.app);
        mapLoader.loadMap().then(map => {
          this.map = map;
          this._createView(map).then(resolve).catch(reject);
        }).catch(reject);
      } else {
        resolve();
      }
    });
  }

  /**
   *
   * @param map
   * @returns {Promise}
   * @private
   */
  _createView(map) {
    return new Promise((resolve, reject) => {
      if (this.app.container && (document.getElementById(this.app.container) != null)) {

        // https://stackoverflow.com/questions/286141/remove-blank-attributes-from-an-object-in-javascript
        const cleanParams = params => {
          return Object.entries(params).reduce((a, [k, v]) => (v == null ? a : (a[k] = v, a)), {})
        };

        const center = this.app?.getParam('center')?.split(',') || null;
        const zoom = this.app?.getParam('zoom', Number) || null;
        const rotation = this.app?.getParam('heading', Number) || null;

        const viewProperties = cleanParams({
          container: this.app.container,
          snapToZoom: Number.isInteger(zoom),
          map, center, zoom, rotation
        });

        const viewLoader = new ViewLoader(viewProperties);
        viewLoader.loadView().then(view => {
          this.view = view;
          resolve();
        }).catch(reject);

      } else {
        resolve();
      }
    });
  }

}

export default AppLoader;
