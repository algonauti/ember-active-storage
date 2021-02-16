import Component from '@glimmer/component';
import { action } from '@ember/object';
import { debug } from '@ember/debug';
import { isPresent } from '@ember/utils';
import { inject as service } from '@ember/service';

export default class FileUploadComponent extends Component {
  @service
  activeStorage;

  @action
  upload(event) {
    const files = event.target.files;

    if (isPresent(files)) {
      for (var i = 0; i < files.length; i++) {
        this.activeStorage
          .upload(files.item(i), '/api/attachments/upload', {
            onProgress(progress) {
              debug('onProgress: ' + progress);
            },
          })
          .then((blob) => {
            debug(`file upload completed ${blob.get('signedId')}`);
          });
      }
    }
  }
}
