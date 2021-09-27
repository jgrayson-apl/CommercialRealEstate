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

import AppParameters from "./AppParameters.js";

class AppBase extends AppParameters {

  // EVENTED //
  _evented;
  // WATCH UTILS //
  _watchUtils;

  // APP NAME //
  name = 'ApplicationTemplate';
  // APP TITLE //
  title = null;
  // APP DESCRIPTION //
  description = null;

  /**
   *
   */
  constructor() {
    super();

    // EVENTED AND WATCHUTILS //
    require(['esri/core/Evented', 'esri/core/watchUtils'], (Evented, watchUtils) => {

      // EVENTED //
      this._evented = new Evented();
      // WATCH UTILS //
      this._watchUtils = watchUtils;

      // APP NAME //
      const pathParts = location.pathname.split('/');
      this.name = String([pathParts[pathParts.length - 2]]);

      // ALERTS AND NOTICES //
      this.initializeAlertNotice();

      // TOGGLE ACTION & PANELS //
      this.initializeSidePanels();

      // STARTUP DIALOG //
      this.initializeStartupDialog();

    });
  }

  /**
   * LOAD APP CONFIG
   *
   * @returns {Promise}
   */
  async load() {
    return new Promise((resolve, reject) => {
      super.load().then(() => {

        // APPLICATION SHARING //
        this.initializeSharing();

        // APP INFO //
        this.configureAppInfo();

        // ANALYTICS //
        this.initializeAnalytics();

        resolve();
      });
    });
  }

  /**
   *
   */
  initializeAlertNotice() {

    const appNotice = document.getElementById('app-notice');
    const noticeTitleNode = appNotice.querySelector('[slot="title"]');
    const noticeMessageNode = appNotice.querySelector('[slot="message"]');

    this.displayAlert = ({title, message}) => {
      noticeTitleNode.innerHTML = title || 'Alert';
      noticeMessageNode.innerHTML = message || 'Something went wrong.';
      appNotice.active = true;
    };

    this.displayError = (error) => {
      noticeTitleNode.innerHTML = error.name || 'Error';
      noticeMessageNode.innerHTML = error.message || JSON.stringify(error, null, 2) || 'Something went wrong.';
      appNotice.active = true;
      console.error(error);
    };

  }

  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
   */
  initializeSharing() {

    // SHARE APPLICATION ACTION //
    const appShareAction = document.getElementById('app-share-action');
    if (appShareAction) {

      // SHARE APPLICATION ALERT & LINK //
      const appShareAlert = document.getElementById('app-share-alert');
      const appShareLink = document.getElementById('app-share-link');

      appShareAction.addEventListener('calciteActionClick', () => {

        // SHARE ALERT //
        const shareURL = this.toShareURL();
        appShareLink.setAttribute('href', shareURL);
        appShareAlert.setAttribute('active', 'true');

        // COPY TO CLIPBOARD //
        navigator.clipboard.writeText(shareURL).then(() => {
          navigator.clipboard.readText().then((clipText) => {
            console.info("SHARE URL COPIED TO CLIPBOARD: ", clipText);
          }, console.error);
        }, console.error);

      });
    }

  }

  /**
   *
   */
  initializeSidePanels() {

    // TOGGLE INFOS //
    const toggleInfos = new Map();

    // TOGGLE PANEL //
    this.togglePanel = (toggleId, active) => {
      // TOGGLE DETAILS BY TOGGLE ID //
      const {toggleActions, togglePanels, sidePanel} = toggleInfos.get(toggleId);
      // ACTIONS //
      toggleActions.forEach(actionNode => {
        actionNode.active = active && (actionNode.dataset.toggle === toggleId);
      });
      // PANELS //
      togglePanels.forEach(panel => {
        panel.hidden = (panel.dataset.toggle !== toggleId);
      });
      // SIDE PANEL //
      sidePanel.collapsed = !active;
    };

    // TOGGLE SIDE PANELS //
    const sidePanels = document.querySelectorAll('calcite-shell-panel');
    sidePanels.forEach(sidePanel => {
      // TOGGLE PANELS //
      const togglePanels = sidePanel.querySelectorAll('.toggle-panel');

      // TOGGLE ACTIONS //
      const toggleActions = sidePanel.querySelectorAll('.toggle-action');
      toggleActions.forEach(toggleAction => {
        // TOGGLE INFOS //
        toggleInfos.set(toggleAction.dataset.toggle, {toggleActions, togglePanels, sidePanel});
        // TOGGLE ACTION //
        toggleAction.addEventListener('click', () => {
          this.togglePanel(toggleAction.dataset.toggle, toggleAction.toggleAttribute('active'));
        });
      });

      // CLOSE ACTIONS //
      const closeActions = sidePanel.querySelectorAll('.toggle-close');
      closeActions.forEach(closeAction => {
        // TOGGLE CLOSE ACTION //
        closeAction.addEventListener('click', () => {
          const toggleAction = sidePanel.querySelector(`.toggle-action[data-toggle="${ closeAction.dataset.toggle }"]`);
          toggleAction.removeAttribute('active');
          this.togglePanel(closeAction.dataset.toggle, false);
        });
      });

    });

  }

  /**
   *
   */
  configureAppInfo() {

    // TITLE //
    this.watch('title', title => {
      document.querySelectorAll('.application-title').forEach(node => {
        node.innerHTML = title;
      });
    });

    // DESCRIPTION //
    const applicationDescriptionNode = document.querySelector('.application-description');
    if (applicationDescriptionNode.innerHTML && applicationDescriptionNode.innerHTML.length > 0) {
      this.description = applicationDescriptionNode.innerHTML;
    }
    this.watch('description', description => {
      if (description) {
        document.querySelectorAll('.application-description').forEach(node => { node.innerHTML = description; });
      }
    });

  }

  /**
   *
   */
  initializeStartupDialog() {

    // APP DETAILS MODAL //
    const appDetailsModal = document.getElementById('app-details-modal');

    // SHOW STARTUP MODAL //
    const showStartupId = `show-startup-${ this.name || 'all' }`;
    const showStartup = localStorage.getItem(showStartupId) || 'show';
    if (showStartup === 'show') {
      appDetailsModal.active = true;
    }

    // HIDE STARTUP DIALOG //
    const hideStartupCheckbox = document.getElementById('hide-startup-checkbox');
    hideStartupCheckbox.checked = (showStartup === 'hide');
    hideStartupCheckbox.addEventListener('calciteCheckboxChange', () => {
      localStorage.setItem(showStartupId, hideStartupCheckbox.checked ? 'hide' : 'show');
    });

    // TOGGLE APP DETAILS DIALOG //
    const appDetailsAction = document.getElementById('app-details-action');
    appDetailsAction.addEventListener('click', () => {
      appDetailsModal.active = (!appDetailsModal.active);
    });

  }

  /**
   *
   */
  initializeAnalytics() {

    // ANALYTICS //
    window.dataLayer = {
      pageType: 'esri-geoxc-apl-demo',
      pagePath: window.location.pathname,
      pageTitle: this.title,
      pageName: this.name
    };

  }

}

export default AppBase;
