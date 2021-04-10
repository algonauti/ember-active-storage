import Component from '@glimmer/component';
import { action } from '@ember/object';
import { debug } from '@ember/debug';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class FileUploadComponent extends Component {
  @service
  activeStorage;

  @tracked fileName = 'No files chosen';

  @action
  setFileNameAndUpload(e) {
    this.setFileName(e);
    this.upload(e);
  }

  @action
  upload(e) {
    const files = e.target.files;
    const progressBarFill = document.querySelector('.progress-bar-fill');
    progressBarFill.style = `width: 0%`;

    if (isPresent(files)) {
      this.activeStorage
        .upload(files[0], '/api/attachments/upload', {
          onProgress: (progress) => {
            progressBarFill.style = `width: ${progress}%`;
          },
          onXHRCreated: (xhr) => {
            debug(`XHR created ${xhr}`);
          },
        })
        .then((blob) => {
          progressBarFill.style = `width: 100%`;
          debug(`file upload completed ${blob.signedId}`);
        });
    }
  }

  @action
  setFileName(e) {
    const fileName = e.target.value.split('\\').pop();
    if (fileName) this.fileName = fileName;
  }
}
