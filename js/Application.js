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

import AppBase from "./support/AppBase.js";
import AppLoader from "./loaders/AppLoader.js";
import CandidateSites from "./CandidateSites.js";

class Application extends AppBase {

  // PORTAL //
  portal;

  constructor() {
    super();

    // LOAD APPLICATION BASE //
    super.load().then(() => {

      // APPLICATION LOADER //
      const applicationLoader = new AppLoader({app: this});
      applicationLoader.load().then(({portal, group, map, view}) => {
        //console.info(portal, group, map, view);

        // PORTAL //
        this.portal = portal;

        // APP TITLE //
        this.title = this.title || map?.portalItem?.title || 'Application';
        // APP DESCRIPTION //
        this.description = this.description || map?.portalItem?.description || group?.description || '...';

        // USER SIGN-IN //
        this.configUserSignIn();

        // APPLICATION //
        this.applicationReady({portal, group, map, view}).catch(this.displayError).then(() => {
          // HIDE APP LOADER //
          document.getElementById('app-loader').removeAttribute('active');
        });

      }).catch(this.displayError);
    }).catch(this.displayError);

  }

  /**
   *
   */
  configUserSignIn() {
    if (this.oauthappid || this.portal?.user) {
      require(['esri/identity/IdentityManager'], (IdentityManager) => {

        // USER SIGN IN DROPDOWN //
        const userSignInDropdown = document.getElementById('user-sign-in-dropdown');
        const userStatusBtn = document.getElementById('user-status-btn');
        const userSignInItem = document.getElementById('user-sign-in-item');
        const userSignOutItem = document.getElementById('user-sign-out-item');

        const updateUserUI = () => {
          return new Promise((resolve, reject) => {
            if (this.portal) {
              const hasUser = (this.portal.user != null)

              userStatusBtn && (userStatusBtn.disabled = false);
              userStatusBtn && (userStatusBtn.innerHTML = hasUser ? this.portal.user.username : 'not signed in');
              userStatusBtn && (userStatusBtn.title = hasUser ? this.portal.user.fullName : '');
              userSignInItem && (userSignInItem.hidden = hasUser);
              userSignOutItem && (userSignOutItem.hidden = !hasUser);

              resolve();
            } else {
              userStatusBtn && (userStatusBtn.disabled = true);
              reject(new Error(`Can't sign in to '${ this.portal.name }' [${ this.portal.url }]`));
            }
          });
        };

        const userSignIn = () => {
          return new Promise((resolve, reject) => {
            this.portal.authMode = 'immediate';
            this.portal.load().then(() => {
              updateUserUI().then(resolve);
            }).catch(reject).then();
          });
        };

        const userSignOut = () => {
          return new Promise((resolve, reject) => {
            IdentityManager.destroyCredentials();
            // this.portal = new Portal({});
            this.portal.load().then(() => {
              this.portal.user = null;
              updateUserUI().then(resolve);
            }).catch(reject).then();
          });
        };

        if (this.portal) {
          userSignInItem && userSignInItem.addEventListener('click', userSignIn)
          userSignOutItem && userSignOutItem.addEventListener('click', userSignOut)
          this._watchUtils.init(this.portal, 'user', (user) => {
            updateUserUI().then(() => {
              user && userSignInDropdown && userSignInDropdown.removeAttribute('hidden');
              this._evented.emit('user-change', {user: this.portal.user});
            }).catch(this.displayError);
          });
        }
      });

    }
  }

  /**
   *
   * @param view
   */
  configView(view) {
    return new Promise((resolve, reject) => {
      if (view) {
        require([
          'esri/widgets/Home',
          'esri/widgets/Search',
          'esri/widgets/LayerList',
          'esri/widgets/Legend'
        ], (Home, Search, LayerList, Legend) => {

          //
          // CONFIGURE VIEW SPECIFIC STUFF HERE //
          //
          view.set({
            constraints: {snapToZoom: false},
            highlightOptions: {
              color: 'transparent',
              fillOpacity: 0.0,
              haloColor: '#edd317',
              haloOpacity: 0.9
            }
          });

          // HOME //
          const home = new Home({view});
          view.ui.add(home, {position: 'top-left', index: 0});

          // LEGEND //
          /*
           const legend = new Legend({ view: view });
           view.ui.add(legend, {position: 'bottom-left', index: 0});
           */

          // LAYER LIST //
          const layerList = new LayerList({
            container: 'layer-list-container',
            view: view,
            listItemCreatedFunction: (event) => {
              event.item.open = (event.item.layer.type === 'group');
            },
            visibleElements: {statusIndicators: true}
          });

          // VIEW UPDATING //
          // const viewUpdating = document.getElementById('view-updating');
          // this._watchUtils.init(view, 'updating', updating => {
          //   viewUpdating.toggleAttribute('active', updating);
          // });

          resolve();
        });
      } else { resolve(); }
    });
  }

  /**
   *
   * @param portal
   * @param group
   * @param map
   * @param view
   * @returns {Promise}
   */
  applicationReady({portal, group, map, view}) {
    return new Promise(async (resolve, reject) => {
      this.configView(view).then(() => {

        this.initializeCandidateSites(view);

        resolve();
      }).catch(reject);
    });
  }

  /**
   *
   * @param view
   */
  initializeCandidateSites(view) {
    if (view) {
      require(['esri/core/promiseUtils',], (promiseUtils) => {

        // DEFAULT EXTENT //
        const defaultExtent = view.extent.clone();

        // CAN ADD SITE ACTION //
        const canAddSiteAction = document.getElementById('can-add-site-action');

        // SITE TYPE OPTIONS //
        const siteTypeOptions = document.querySelector('#site-type-options');

        // LIST OF FEATURES //
        const featuresList = document.getElementById('features-list');

        // VIEW CONTAINER //
        const viewContainers = document.getElementById('view-containers');

        // LAYER INFO //
        const layerInfo = {
          title: 'Candidate Sites',
          queryParams: {
            returnGeometry: true,
            outFields: ['OBJECTID', 'Location_Name', 'SiteType', 'Status', 'Address', 'Parking', 'SQFT', 'Performance'],
            orderByFields: ['Location_Name ASC']
          },
          itemInfos: {
            label: f => f.attributes.Location_Name,
            description: f => `${ f.attributes.Address.split(',')[0] } - ${ f.attributes.SQFT.toLocaleString() } sq/ft`
          }
        };

        // FEATURE LAYER //
        const featureLayer = view.map.layers.find(layer => { return (layer.title === layerInfo.title); });
        if (featureLayer) {
          featureLayer.load().then(() => {
            featureLayer.set({outFields: layerInfo.queryParams.outFields});

            // FEATURES BY OID //
            let featuresByOID = new Map();

            // FEATURE SELECTED //
            const featureSelected = (featureOID) => {
              if (featureOID) {
                // SITE FEATURE //
                const siteFeature = featuresByOID.get(featureOID);
                // GO TO SITE FEATURE //
                view.goTo({target: siteFeature, zoom: 15});
              }
            };

            // LIST OF FEATURES //
            featuresList.addEventListener('calciteListChange', (evt) => {
              const featureOID = evt.detail.size ? Number(Array.from(evt.detail.keys())[0]) : null;
              featureSelected(featureOID);
            });

            // FILTER ITEMS BY SITE TYPE //
            const filterSitesByType = (siteType) => {
              featuresList.querySelectorAll('.list-item').forEach(node => {
                node.toggleAttribute('hidden', (node.getAttribute('data-type') !== siteType));
              });
            };

            // TOGGLE SITES ENABLED //
            const toggleSites = (enabled = true) => {
              featuresList.querySelectorAll('.list-item').forEach(node => {
                node.toggleAttribute('disabled', !enabled);
              })
            };


            // CANDIDATE SITES //
            const candidateSites = new CandidateSites({
              parentContainer: viewContainers,
              locationSymbol: featureLayer.renderer.symbol.clone(),
              basemap: view.map.basemap
            });

            // SITES COUNT //
            candidateSites.watch('sitesCount', sitesCount => {
              canAddSiteAction.setAttribute('text', `${ sitesCount } of ${ CandidateSites.MAX_SITES_COUNT }`);
            });
            // CAN ADD SITE //
            candidateSites.watch('canAddSite', canAddSite => {
              canAddSiteAction.setAttribute('icon', canAddSite ? '' : 'exclamation-mark-triangle');
              canAddSiteAction.setAttribute('title', canAddSite ? '' : 'Sites limit reached...');
              toggleSites(canAddSite);
            });

            // ADD CANDIDATE SITE //
            const addCandidateSite = (featureOID) => {
              // SITE FEATURE //
              const siteFeature = featuresByOID.get(featureOID);

              // DISPLAY CANDIDATE SITE INFORMATION //
              toggleSites(false);
              candidateSites.displayCandidateSite({siteFeature}).catch(console.error).finally(()=>{
                toggleSites(candidateSites.canAddSite);
              });
            }

            // FEATURE ITEM TEMPLATE //
            const featureItemTemplate = document.getElementById('feature-item-template');
            // CREATE ITEM NODE //
            const createFeatureItemNodes = (feature) => {
              const templateNode = featureItemTemplate.content.cloneNode(true);

              // FEATURE OID //
              const featureOID = feature.getObjectId();
              const siteType = feature.getAttribute('SiteType');

              // ITEM NODE //
              const itemNode = templateNode.querySelector('.list-item');
              itemNode.setAttribute('label', layerInfo.itemInfos.label(feature));
              itemNode.setAttribute('description', layerInfo.itemInfos.description(feature));
              itemNode.setAttribute('value', featureOID);
              itemNode.setAttribute('data-type', siteType);

              // ITEM ACTION NODE //
              const itemActionNode = templateNode.querySelector('.list-item-action');
              itemActionNode.addEventListener('click', () => {

                try {
                  addCandidateSite(featureOID);
                } catch (error) {
                  console.error(error);
                }

              });

              return itemNode;
            };

            // UPDATE FEATURES LIST //
            const updateFeaturesList = features => {
              // FEATURES BY OID //
              featuresByOID = features.reduce((list, feature) => {
                return list.set(feature.getObjectId(), feature);
              }, new Map());
              // CREATE AND ADD FEATURE ITEMS //
              featuresList.append(...features.map(createFeatureItemNodes));
            };

            // GET FEATURES BASED ON FILTER //
            const getFeatures = (filter) => {
              return promiseUtils.create((resolve, reject) => {
                const featuresQuery = featureLayer.createQuery();
                featuresQuery.set({where: filter || '1=1', ...layerInfo.queryParams});
                featureLayer.queryFeatures(featuresQuery).then(featuresFS => {
                  resolve(featuresFS.features);
                }).catch(reject);
              });
            };

            // SITE TYPE SELECTED //
            siteTypeOptions.addEventListener('calciteRadioGroupChange', () => {
              filterSitesByType(siteTypeOptions.selectedItem.value);
              view.goTo({target: defaultExtent});
            });

            // GET ALL FEATURES //
            getFeatures().then((features) => {
              updateFeaturesList(features);
              featuresList.loading = false;
              filterSitesByType(siteTypeOptions.selectedItem.value);
            }).catch(console.error);

          });
        } else {
          this.displayAlert({
            title: `Can't Find Layer`,
            message: `The layer '${ layerInfo.title }' can't be found in this map.`
          });
        }
      });

    }
  }

}

export default new Application();
