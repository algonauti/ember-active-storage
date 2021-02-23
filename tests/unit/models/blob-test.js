import { module, test } from 'qunit';

import Blob from 'ember-active-storage/model/blob';
import FileChecksum from 'ember-active-storage/utils/file-checksum';
import { setupTest } from 'ember-qunit';

module('Unit | Model | blob', function (hooks) {
  setupTest(hooks);

  const file = new File(['foo'], 'foo.txt', { type: 'text/plain' });
  const fileChecksum = new FileChecksum(file);

  test('is generated correctly', async function (assert) {
    const checksum = await fileChecksum.createMD5();
    const blob = await Blob.build(file);
    assert.equal(blob.checksum, checksum);
    assert.equal(blob.file, file);
    assert.equal(blob.name, 'foo.txt');
    assert.equal(blob.type, 'text/plain');
    assert.equal(blob.size, 3);
    const blobToString = blob.toString();
    assert.equal(
      blobToString,
      'Blob: foo.txt with checksum rL0Y20zC+Fzt72VPzMSk2A=='
    );
  });
});
