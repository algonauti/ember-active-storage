import Service from '@ember/service';
import { inject } from '@ember/service';
import { task } from 'ember-concurrency';
import { get, setProperties } from '@ember/object';
import { debug, inspect } from '@ember/debug';
import Blob from 'ember-active-storage/model/blob';

export default Service.extend({
  ajax: inject(),

  upload(file, url) {
    Blob.build(file).then( (blob) => {
      get(this, '_uploadTask').perform(blob, url);
    });
  },

  _uploadTask: task(function * (blob, url) {
    debug(`ActiveStorage: _uploadTask`)

    yield get(this, '_directUpload').perform(blob, url);
    yield get(this, '_blobUpload').perform(blob);
  }),

  _directUpload: task(function * (blob, url) {
    debug(`ActiveStorage: _directUpload ${blob} to url ${url}`)

    yield this.get('ajax').request(url, {
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
  }),

  _blobUpload: task(function * (blob) {
    debug(`ActiveStorage: _blobUpload ${blob}`)

    yield this.get('ajax').request(get(blob, 'directUploadData.url'), {
      method: 'PUT',
      headers: get(blob, 'directUploadData.headers'),
      processData: false,
      contentType: get(blob, 'type'),
      data: get(blob, 'file')
    })
  })
});
