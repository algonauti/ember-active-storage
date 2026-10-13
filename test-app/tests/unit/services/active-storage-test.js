import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import fetchFile from 'test-app/tests/helpers/fetch-file';

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
      'application/pdf',
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
      'application/pdf',
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

  test('upload() invokes onProgress callback', async function (assert) {
    const values = [];
    await service.upload(file, '/api/attachments/upload', {
      onProgress: (progress) => {
        values.push(progress);
      },
    });
    assert.ok(values.length > 0);
    assert.ok(values.every((progress) => progress > 0 && progress <= 100));
  });

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

  test('upload() invokes onProgress callback without upload url', async function (assert) {
    const values = [];
    await service.upload(file, {
      onProgress: (progress) => {
        values.push(progress);
      },
    });
    assert.ok(values.length > 0);
    assert.ok(values.every((progress) => progress > 0 && progress <= 100));
  });
});
