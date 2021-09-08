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

export default class SynchronizedViews {

  _views;
  _syncViewsHandle;

  static SYNC_TYPE = {
    'NONE': 0,
    'LOCATION': 1,
    'SCALE': 2,
    'LOCATION_AND_SCALE': 3
  }
  _syncType = SynchronizedViews.SYNC_TYPE.NONE;

  get syncType() {
    return this._syncType;
  }

  set syncType(syncType) {
    this._syncType = syncType;
    this.enable(this._syncType !== SynchronizedViews.SYNC_TYPE.NONE);
  }

  /**
   *
   * @param views
   */
  constructor({views}) {
    // WATCH UTILS //
    require(['esri/core/watchUtils'], (watchUtils) => {
      this.watchUtils = watchUtils;

      this._views = views;
      this.syncType = (this._views && (this._views.length > 0))
        ? SynchronizedViews.SYNC_TYPE.LOCATION_AND_SCALE
        : SynchronizedViews.SYNC_TYPE.NONE;

    });
  }

  /**
   *
   * @param enabled
   */
  enable(enabled) {
    if (enabled) {
      this._syncViewsHandle = this._synchronizeViews(this._views);
      this.sync(this._views, this._views[0].viewpoint);
    } else {
      this._syncViewsHandle && this._syncViewsHandle.disable();
    }
  }

  /*add(view) {
   this._syncViewsHandle && this._syncViewsHandle.disable();
   this._views.push(view);
   this._syncViewsHandle = this._synchronizeViews(this._views);
   }*/

  /**
   *
   * @param views
   * @param viewpoint
   */
  sync(views, viewpoint) {
    if (viewpoint) {

      let syncOptions = {};

      switch (this.syncType) {
        case SynchronizedViews.SYNC_TYPE.LOCATION:
          syncOptions = {
            center: viewpoint.targetGeometry,
            rotation: viewpoint.rotation
          };
          break;

        case SynchronizedViews.SYNC_TYPE.SCALE:
          syncOptions = {
            scale: viewpoint.scale,
            rotation: viewpoint.rotation
          };
          break;

        case SynchronizedViews.SYNC_TYPE.LOCATION_AND_SCALE:
          syncOptions = {
            viewpoint: viewpoint
          };
          break;
      }

      // APPLY SYNC OPTIONS //
      views.forEach((otherView) => { otherView.set(syncOptions);});

    }
  }

  /**
   *
   * @param view
   * @param others
   * @returns {{remove: Boolean}}
   * @private
   */
  _synchronizeView(view, others) {
    others = Array.isArray(others) ? others : [others];

    let viewpointWatchHandle;
    let viewStationaryHandle;
    let otherInteractHandlers;
    let scheduleId;

    const clear = () => {
      if (otherInteractHandlers) {
        otherInteractHandlers.forEach((handle) => {
          handle.remove();
        });
      }
      viewpointWatchHandle && viewpointWatchHandle.remove();
      viewStationaryHandle && viewStationaryHandle.remove();
      scheduleId && clearTimeout(scheduleId);
      otherInteractHandlers = viewpointWatchHandle = viewStationaryHandle = scheduleId = null;
    };

    const interactWatcher = view.watch('interacting,animation', (newValue) => {
      if (!newValue) { return; }
      if (viewpointWatchHandle || scheduleId) { return; }

      if (!view.animation) {
        //others.forEach((otherView) => { otherView.viewpoint = view.viewpoint; });
        this.sync(others, view.viewpoint);
      }

      // start updating the other views at the next frame
      scheduleId = setTimeout(() => {
        scheduleId = null;
        viewpointWatchHandle = view.watch('viewpoint', (newValue) => {
          //others.forEach((otherView) => { otherView.viewpoint = newValue; });
          this.sync(others, newValue);
        });
      }, 0);

      // stop as soon as another view starts interacting, like if the user starts panning
      otherInteractHandlers = others.map((otherView) => {
        return this.watchUtils.watch(otherView, 'interacting,animation', (value) => {
          if (value) { clear(); }
        });
      });

      // or stop when the view is stationary again
      viewStationaryHandle = this.watchUtils.whenTrue(view, 'stationary', clear);
    });

    return {
      remove: () => {
        this.remove = () => { };
        clear();
        interactWatcher.remove();
      }
    }
  }

  /**
   *
   * @param views
   * @returns {{disable: Boolean}}
   * @private
   */
  _synchronizeViews(views) {

    let handles = views.map((view, idx, views) => {
      const others = views.concat();
      others.splice(idx, 1);
      return this._synchronizeView(view, others);
    });

    return {
      disable: () => {
        this.disable = () => { };
        handles && handles.forEach((h) => { h.remove(); });
        handles = null;
      }
    }
  }

}
