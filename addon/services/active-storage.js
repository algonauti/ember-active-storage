import { isPresent, typeOf } from '@ember/utils';

import Blob from '@algonauti/ember-active-storage/model/blob';
import { Promise as EmberPromise } from 'rsvp';
import Service from '@ember/service';
import Uploader from '@algonauti/ember-active-storage/-private/uploader';
import { assert } from '@ember/debug';
import { cached } from '@glimmer/tracking';
import { getOwner } from '@ember/application';

export default class ActiveStorageService extends Service {
  @cached
  get _config() {
    const config =
      getOwner(this).resolveRegistration('config:environment') || {};

    return config['ember-active-storage'] || {};
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
        uploader.upload(blob, url, resolve, reject);
      });
    });
  }
}
