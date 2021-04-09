import { capitalize } from '@ember/string';
import request from '@algonauti/ember-active-storage/-private/request';
import { run } from '@ember/runloop';
import { setProperties } from '@ember/object';

export default class Uploader {
  constructor({ headers, ...events }) {
    this.headers = headers;
    this.events = events;
  }

  upload(blob, url, resolve, reject) {
    this._uploadTask(blob, url)
      .then((blob) => resolve(blob))
      .catch((error) => reject(error));
  }

  async _uploadTask(blob, url) {
    const response = await this._directUpload(blob, url);
    this._blobUpdate(blob, response);
    await this._blobUpload(blob);

    return blob;
  }

  _directUpload(blob, url) {
    return request(url, {
      method: 'POST',
      headers: this.headers,
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        blob: {
          filename: blob.name,
          content_type: blob.type,
          byte_size: blob.size,
          checksum: blob.checksum,
        },
      }),
      xhr: () => {
        var xhr = new XMLHttpRequest();
        this._addCreatedListener(xhr);
        return xhr;
      },
    });
  }

  _blobUpdate(blob, response) {
    setProperties(blob, {
      id: response.id,
      signedId: response.signed_id,
      key: response.key,
      directUploadData: response.direct_upload,
    });
  }

  _blobUpload(blob) {
    return request(blob.directUploadData.url, {
      method: 'PUT',
      headers: blob.directUploadData.headers,
      dataType: 'text',
      data: blob.slice(),
      xhr: () => {
        var xhr = new XMLHttpRequest();
        this._addListeners(xhr);
        this._addCreatedListener(xhr);
        xhr.upload.addEventListener('progress', (event) => {
          this._uploadRequestDidProgress(event);
        });
        return xhr;
      },
    });
  }

  _addListeners(xhr) {
    ['loadstart', 'load', 'loadend', 'error', 'abort', 'timeout'].forEach(
      (name) => {
        xhr.addEventListener(name, (event) => {
          this._handleEvent(event);
        });
      }
    );
  }

  _addCreatedListener(xhr) {
    xhr.addEventListener('XHRCreated', ({ detail }) => {
      this.events['onXHRCreated']?.(detail);
    });
  }

  _uploadRequestDidProgress(event) {
    const progress = Math.ceil((event.loaded / event.total) * 100);

    if (progress) {
      run(() => this.events.onProgress?.(progress));
    }
  }

  _handleEvent(e) {
    this.events[`on${capitalize(e.type)}`]?.(e);
  }
}
