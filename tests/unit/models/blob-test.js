import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { get } from '@ember/object';
import FileChecksum from 'ember-active-storage/utils/file-checksum';
import Blob from 'ember-active-storage/model/blob';

module('Unit | Model | blob', function(hooks) {

  setupTest(hooks);

  const file = new File(['foo'], "foo.txt", { type: "text/plain" });
  const fileChecksum = FileChecksum.create({ file: file });

  test('is generated correctly', async function (assert) {

    const checksum = await fileChecksum.createMD5();
    const blob = await Blob.build(file);
    assert.ok(blob.checksum === checksum);
    assert.ok(blob.file === file);
    assert.ok(get(blob, 'name') === 'foo.txt');
    assert.ok(get(blob, 'type') === 'text/plain');
    assert.ok(get(blob, 'size') === 3);

    const blobToString = blob.toString();
    assert.ok(blobToString === `Blob: foo.txt with checksum rL0Y20zC+Fzt72VPzMSk2A==`)

  });
});
