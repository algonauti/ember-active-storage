import { module, test } from 'qunit';

import FileChecksum from '@algonauti/ember-active-storage/utils/file-checksum';

module('Unit | Utility | file-checksum', function () {
  const file = new File(['foo'], 'foo.txt', { type: 'text/plain' });

  test('initializes correctly', function (assert) {
    const fileChecksum = new FileChecksum(file);
    assert.ok(fileChecksum);
  });

  test('is generated correctly', async function (assert) {
    const fileChecksum = new FileChecksum(file);
    const checksum = await fileChecksum.createMD5();
    const decodedChecksum = atob(checksum);
    assert.equal(checksum.length, 24);
    assert.equal(checksum, 'rL0Y20zC+Fzt72VPzMSk2A==');
    assert.equal(typeof decodedChecksum, 'string');
    assert.equal(decodedChecksum.indexOf('\uFFFD'), -1);
    assert.equal(decodedChecksum.length, 16);
  });

  test('is encoded correctly', async function (assert) {
    const fileChecksum = new FileChecksum(file);
    const checksum = await fileChecksum.createMD5();
    const base64Pattern = RegExp('^[a-zA-Z0-9+/]*={0,2}$');
    assert.equal(checksum.length % 4, 0);
    assert.ok(base64Pattern.test(checksum));
  });
});
