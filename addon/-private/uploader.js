import EmberObject from '@ember/object';
import { inject } from '@ember/service';
import { task } from 'ember-concurrency';
import { run } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';
import { get, setProperties } from '@ember/object';

var Uploader = EmberObject.extend({
  ajax: inject(),

  upload(blob, url, resolve, reject) {
    get(this, '_uploadTask').perform(blob, url, resolve, reject);
  },

  _uploadTask: task(function * (blob, url, resolve, reject) {
    try {
      yield this._directUpload(blob, url);
      yield this._blobUpload(blob);
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  }),

  _directUpload(blob, url) {
    return this.get('ajax').request(url, {
      method: 'POST',
      data: {
        blob: {
          filename: blob.get('name'),
          content_type: blob.get('type'),
          byte_size: blob.get('size'),
          checksum: blob.get('checksum')
        }
      }
    }).then( (response) => {
      setProperties(blob, {
        id: response.id,
        signedId: response.signed_id,
        key: response.key,
        directUploadData: response.direct_upload
      });
    });
  },

  _blobUpload(blob) {
    return this.get('ajax').request(get(blob, 'directUploadData.url'), {
      method: 'PUT',
      headers: get(blob, 'directUploadData.headers'),
      processData: false,
      contentType: get(blob, 'type'),
      data: get(blob, 'file'),
      xhr: () => {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => this._uploadRequestDidProgress(event));
        return xhr;
      },
    });
  },

  _uploadRequestDidProgress(event) {
    const progress = Math.ceil(event.loaded / event.total * 100);
    if (progress) {
      run(() => tryInvoke(this, `onProgress`, [progress]));
    }
  }

});

Uploader.toString = () => 'Uploader';

export default Uploader;