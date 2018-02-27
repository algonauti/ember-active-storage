import EmberObject from '@ember/object';
import { computed, get } from '@ember/object';
import { Promise as EmberPromise } from 'rsvp';

import FileChecksum from 'ember-active-storage/utils/file-checksum';

export default EmberObject.extend({
  // Default Values

  file: null,
  checksum: null,

  // Single-line Computed Properties

  name: computed.alias('file.name'),
  type: computed.alias('file.type'),
  size: computed.alias('file.size'),

  toString() {
    return `Blob: ${get(this, 'name')} with checksum ${get(this, 'checksum')}`
  }

}).reopenClass({

  build(file) {
    return new EmberPromise((resolve, reject) => {
      FileChecksum.MD5(file).then( (checksum) => {
        const blob = this.create({ file: file, checksum: checksum });
        resolve(blob);
      }, (error) => {
        reject(error)
      });
    });
  }

});
