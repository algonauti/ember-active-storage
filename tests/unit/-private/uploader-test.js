import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Blob from 'ember-active-storage/model/blob';
import Uploader from 'ember-active-storage/-private/uploader';

module('Unit | -Private | uploader', function(hooks) {
  setupTest(hooks);

  const file = new File(['foo'], "foo.txt", { type: "text/plain" });

  test('blob properties set with server response', async function(assert) {
    const blob = await Blob.build(file);
    const uploader = Uploader.create(this.owner.ownerInjection());
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

});
