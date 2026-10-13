import { debug } from '@ember/debug';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FileUploadComponent extends Component {
  @service
  activeStorage;

  @tracked fileName = 'No files chosen';

  @action
  setFileName(e) {
    const fileName = e.target.value.split('\\').pop();
    if (fileName) {
      this.fileName = fileName;
    }
  }

  @action
  setFileNameAndUpload(e) {
    this.setFileName(e);
    this.upload(e);
  }

  @action
  upload(e) {
    const files = e.target.files;
    const progressBarFill = document.querySelector('.progress-bar-fill');
    progressBarFill.style.width = `0%`;

    if (isPresent(files)) {
      this.activeStorage
        .upload(files[0], '/api/attachments/upload', {
          onProgress: (progress) => {
            progressBarFill.style.width = `${progress}%`;
          },
          onXHROpened: (xhr) => {
            debug(`XHR created ${xhr}`);
          },
        })
        .then((blob) => {
          progressBarFill.style.width = `100%`;
          debug(`file upload completed ${blob.signedId}`);
        });
    }
  }
}
