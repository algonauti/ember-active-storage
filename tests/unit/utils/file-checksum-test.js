import { module, test } from 'qunit';
import FileChecksum from 'ember-active-storage/utils/file-checksum';

module('Unit | Utility | file-checksum', function() {

  const file = new File(['foo'], "foo.txt", { type: "text/plain" });

  test('initializes correctly', function(assert) {
    const fileChecksum = FileChecksum.create({ file: file });
    assert.ok(fileChecksum);
  });

  test('is generated correctly', async function(assert) {
    const fileChecksum = FileChecksum.create({ file: file });
    const checksum = await fileChecksum.createMD5();
    const decodedChecksum = atob(checksum);
    assert.equal(typeof(decodedChecksum), 'string');
    assert.equal(decodedChecksum.indexOf("\uFFFD"), -1);
    assert.equal(decodedChecksum.length, 16);
  });

  test('is encoded correctly', async function(assert) {
    const fileChecksum = FileChecksum.create({ file: file });
    const checksum = await fileChecksum.createMD5();
    const base64Pattern = RegExp("^[a-zA-Z0-9+/]*={0,2}$");
    assert.equal(checksum.length % 4, 0);
    assert.ok(base64Pattern.test(checksum));
  });
});
