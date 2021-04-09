import { isPresent, typeOf } from '@ember/utils';

import Blob from '@algonauti/ember-active-storage/model/blob';
import { Promise as EmberPromise } from 'rsvp';
import Service from '@ember/service';
import Uploader from '@algonauti/ember-active-storage/-private/uploader';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';

export default class ActiveStorageService extends Service {
  @tracked aborted;

  constructor() {
    super(...arguments);

    this.aborted = false;
  }

  get _config() {
    const config =
      getOwner(this).resolveRegistration('config:environment') || {};

    return config['ember-active-storage'] || {};
  }

  abortAll() {
    this.aborted = true;

    later(this, () => {
      this.aborted = false;
    }, 3000); // wait 3 seconds and switch back to false
  }

  upload(file, urlOrCallbacks, callbacks = {}) {
    let url;

    if (isPresent(urlOrCallbacks)) {
      if (typeOf(urlOrCallbacks) == 'string') {
        url = urlOrCallbacks;
      } else if (typeOf(urlOrCallbacks) == 'object') {
        assert(
          "If not explicitly passed, URL must be set on ENV['ember-active-storage'] = { url: '...' }",
          isPresent(this._config['url'])
        );

        callbacks = urlOrCallbacks;
        url = this._config['url'];
      }
    } else {
      assert(
        "If not explicitly passed, URL must be set on ENV['ember-active-storage'] = { url: '...' }",
        isPresent(this._config['url'])
      );

      url = this._config['url'];
    }

    const uploader = new Uploader({ headers: this.headers, ...callbacks });

    return new EmberPromise((resolve, reject) => {
      Blob.build(file).then((blob) => {
        uploader.upload(blob, url, this.aborted, resolve, reject);
      });
    });
  }
}
