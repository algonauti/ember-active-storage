import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import { tryInvoke } from '@ember/utils';
import { get, setProperties } from '@ember/object';

var Uploader = EmberObject.extend({
  ajax: service(),

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
    return this.get('ajax').request(url, {
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        blob: {
          filename: blob.get('name'),
          content_type: blob.get('type'),
          byte_size: blob.get('size'),
          checksum: blob.get('checksum')
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
