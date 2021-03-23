import { module, test } from 'qunit';

import Blob from '@algonauti/ember-active-storage/model/blob';
import Uploader from '@algonauti/ember-active-storage/-private/uploader';
import { set } from '@ember/object';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupTest } from 'ember-qunit';

module('Unit | -Private | uploader', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let file, uploader, blob;

  hooks.beforeEach(async function () {
    file = new File(['foo'], 'foo.txt', { type: 'text/plain' });
    uploader = new Uploader({});
    blob = await Blob.build(file);
  });

  test('_directUpload() sets correct attributes into POST request body', async function (assert) {
    let expectedAttributes = {
      blob: {
        byte_size: blob.size,
        checksum: blob.checksum,
        content_type: blob.type,
        filename: blob.name,
      },
    };
    let attributes;
    this.server.post('/attachments/upload', function (_db, request) {
      attributes = JSON.parse(request.requestBody);
    });

    await uploader._directUpload(blob, '/api/attachments/upload');
    assert.deepEqual(attributes, expectedAttributes);
  });

  test('_blobUpdate() sets properties into blob from server response', function (assert) {
    const response = {
      id: 123,
      key: 'cwUyfscVbcMNdo26Fkn9uHrW',
      filename: blob.filename,
      content_type: blob.content_type,
      byte_size: blob.byte_size,
      checksum: blob.checksum,
      signed_id:
        'eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCdz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d4c77635d82e4b007598f79bc3f785854eac27b9',
      direct_upload: {
        url: '/api/attachments/direct-upload',
        headers: {
          'Content-Type': blob.content_type,
        },
      },
    };

    uploader._blobUpdate(blob, response);

    assert.equal(blob.id, response.id);
    assert.equal(blob.signedId, response.signed_id);
    assert.equal(blob.key, response.key);
    assert.deepEqual(blob.directUploadData, response.direct_upload);
  });

  test('_blobUpload() sets correct attributes into PUT request body', async function (assert) {
    let expectedAttributes = blob.slice();
    let attributes;
    this.server.put('/attachments/direct-upload', function (_db, request) {
      attributes = request.requestBody;
    });
    set(blob, 'directUploadData', {
      url: '/api/attachments/direct-upload',
      headers: {
        'Content-Type': blob.content_type,
      },
    });

    await uploader._blobUpload(blob);
    assert.deepEqual(attributes, expectedAttributes);
  });
});
