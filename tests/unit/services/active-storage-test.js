import { moduleFor, test } from 'ember-qunit';

moduleFor('service:active-storage', 'Unit | Service | active storage', {
  needs: ['service:ajax']
});

test('service#upload', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
