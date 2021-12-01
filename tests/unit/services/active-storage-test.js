import { module, test } from 'qunit';

import fetchFile from 'dummy/tests/helpers/fetch-file';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupTest } from 'ember-qunit';

module('Unit | Service | active-storage', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let service, file;

  hooks.beforeEach(async function () {
    service = this.owner.lookup('service:active-storage');
    file = await fetchFile('/sample.pdf');
  });

  test('upload() returns blob model', async function (assert) {
    let blob = await service.upload(file, '/api/attachments/upload');
    assert.equal(blob.name, 'sample.pdf');
    assert.equal(blob.type, 'application/pdf');
    assert.equal(blob.size, 6081);
    assert.equal(blob.id, 123);
    assert.ok(blob.signedId);
    assert.ok(blob.key);
    assert.equal(blob.directUploadData.url, '/api/attachments/direct-upload');
    assert.equal(
      blob.directUploadData.headers['Content-Type'],
      'application/pdf'
    );
  });

  test('upload() returns blob model without upload url', async function (assert) {
    let blob = await service.upload(file);
    assert.equal(blob.name, 'sample.pdf');
    assert.equal(blob.type, 'application/pdf');
    assert.equal(blob.size, 6081);
    assert.equal(blob.id, 123);
    assert.ok(blob.signedId);
    assert.ok(blob.key);
    assert.equal(blob.directUploadData.url, '/api/attachments/direct-upload');
    assert.equal(
      blob.directUploadData.headers['Content-Type'],
      'application/pdf'
    );
  });

  test('upload() invokes onLoadstart callback', async function (assert) {
    assert.expect(1);
    await service.upload(file, '/api/attachments/upload', {
      onLoadstart: (event) => {
        assert.strictEqual(event.type, 'loadstart');
      },
    });
  });

  test('upload() invokes onLoad callback', async function (assert) {
    assert.expect(1);
    await service.upload(file, '/api/attachments/upload', {
      onLoad: (event) => {
        assert.strictEqual(event.type, 'load');
      },
    });
  });

  test('upload() invokes onLoadend callback', async function (assert) {
    assert.expect(1);
    await service.upload(file, '/api/attachments/upload', {
      onLoadend: (event) => {
        assert.strictEqual(event.type, 'loadend');
      },
    });
  });

  /* eslint-disable qunit/require-expect */
  test('upload() invokes onProgress callback', async function (assert) {
    let n = 0;
    await service.upload(file, '/api/attachments/upload', {
      onProgress: (progress) => {
        n++;
        assert.ok(progress > 0);
        assert.ok(progress <= 100);
      },
    });
    assert.ok(n > 0);
  });
  /* eslint-enable qunit/require-expect */

  test('upload() invokes onLoadstart callback without upload url', async function (assert) {
    assert.expect(1);
    await service.upload(file, {
      onLoadstart: (event) => {
        assert.strictEqual(event.type, 'loadstart');
      },
    });
  });

  test('upload() invokes onLoad callback without upload url', async function (assert) {
    assert.expect(1);
    await service.upload(file, {
      onLoad: (event) => {
        assert.strictEqual(event.type, 'load');
      },
    });
  });

  test('upload() invokes onLoadend callback without upload url', async function (assert) {
    assert.expect(1);
    await service.upload(file, {
      onLoadend: (event) => {
        assert.strictEqual(event.type, 'loadend');
      },
    });
  });

  /* eslint-disable qunit/require-expect */
  test('upload() invokes onProgress callback without upload url', async function (assert) {
    let n = 0;
    await service.upload(file, {
      onProgress: (progress) => {
        n++;
        assert.ok(progress > 0);
        assert.ok(progress <= 100);
      },
    });
    assert.ok(n > 0);
  });
  /* eslint-enable qunit/require-expect */
});
