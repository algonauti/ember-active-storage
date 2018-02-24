import Component from '@ember/component';
import { inject } from '@ember/service';
import { get } from '@ember/object';
import { isPresent } from '@ember/utils';
import { debug } from '@ember/debug';

import layout from '../templates/components/file-upload';

export default Component.extend({
  layout,

  activeStorage: inject(),

  actions: {
    upload(event) {
      const files = event.target.files;

      if (isPresent(files)) {
        for (var i = 0; i < files.length; i++) {
          get(this, 'activeStorage').upload(files.item(i), 'http://localhost:4200/api/attachments/upload', {
            onProgress(progress) {
              debug("onProgress: " + progress);
            }
          }).then( (blob) => {
            debug(`file upload completed ${blob.get('signedId')}`);
          });
        }
      }
    }
  }
});
