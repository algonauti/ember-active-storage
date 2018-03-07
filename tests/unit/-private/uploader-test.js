/* global server */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Blob from 'ember-active-storage/model/blob';
import Uploader from 'ember-active-storage/-private/uploader';
import { get } from '@ember/object';

module('Unit | -Private | uploader', function(hooks) {

  setupTest(hooks);

  let file, uploader;

  hooks.beforeEach(function() {

    file = new File(['foo'], "foo.txt", { type: "text/plain" });
    uploader = Uploader.create(this.owner.ownerInjection());

  })

  test('blob properties set with server response', async function(assert) {

    const blob = await Blob.build(file);
    const directUploadData = {
      url: '/api/attachments/direct-upload',
      headers: { 'Content-Type': 'text/plain' }
    };
    await uploader._directUpload(blob, '/api/attachments/upload');
    assert.ok(blob.id === 123);
    assert.ok(blob.signedId === 'eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCdz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d4c77635d82e4b007598f79bc3f785854eac27b9');
    assert.ok(blob.key === "cwUyfscVbcMNdo26Fkn9uHrW");
    assert.deepEqual(blob.directUploadData, directUploadData);

  });

  test('blob upload put request body has correct attributes', async function(assert) {

    server.put('/attachments/direct-upload', function(db, request)  {
      const expectedAttributes = get(blob, 'file');
      const attributes = request.requestBody;
      assert.deepEqual(attributes, expectedAttributes);
    });

    const blob = await Blob.build(file);
    await uploader._directUpload(blob, '/api/attachments/upload');
    await uploader._blobUpload(blob);

  })

  test('direct upload post request body has correct attributes', async function(assert) {

    server.post('/attachments/upload', function(db, request)  {
      const attributes = JSON.parse(request.requestBody);
      const expectedAttributes = {
        "blob": {
          "byte_size": 3,
          "checksum": "rL0Y20zC+Fzt72VPzMSk2A==",
          "content_type": "text/plain",
          "filename": "foo.txt"
        }
      };

      assert.deepEqual(attributes, expectedAttributes);

    });

    const blob = await Blob.build(file);
    await uploader._directUpload(blob, '/api/attachments/upload');

  });



});
