import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';
import { get, setProperties } from '@ember/object';

import request from 'ember-active-storage/-private/request';

var Uploader = EmberObject.extend({

  upload(blob, url, resolve, reject) {
    this._uploadTask(blob, url)
      .then( blob => resolve(blob))
      .catch( error => reject(error));
  },

  async _uploadTask(blob, url) {
    try {
      const response = await this._directUpload(blob, url);
      this._blobUpdate(blob, response);
      await this._blobUpload(blob);
      return blob;
    } catch (error) {
      throw error;
    }
  },

  _directUpload(blob, url) {
    return request(url, {
      method: 'POST',
      headers: get(this, 'headers'),
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        blob: {
          filename: get(blob, 'name'),
          content_type: get(blob, 'type'),
          byte_size: get(blob, 'size'),
          checksum: get(blob, 'checksum')
        }
      })
    });
  },

  _blobUpdate(blob, response) {
    setProperties(blob, {
      id: response.id,
      signedId: response.signed_id,
      key: response.key,
      directUploadData: response.direct_upload
    });
  },

  _blobUpload(blob) {
    return request(get(blob, 'directUploadData.url'), {
      method: 'PUT',
      headers: get(blob, 'directUploadData.headers'),
      dataType: 'text',
      data: blob.slice(),
      xhr: () => {
        var xhr = new XMLHttpRequest();
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
