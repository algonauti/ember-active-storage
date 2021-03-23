import { Promise as EmberPromise } from 'rsvp';
import FileChecksum from '@algonauti/ember-active-storage/utils/file-checksum';
import { tracked } from '@glimmer/tracking';

export default class Blob {
  // Default Values
  @tracked file = null;
  checksum = null;
  id = null;
  signedId = null;
  key = null;
  directUploadData = null;

  constructor(file, checksum) {
    this.file = file;
    this.checksum = checksum;
  }

  // Getters
  get name() {
    return this.file.name;
  }

  get type() {
    return this.file.type;
  }

  get size() {
    return this.file.size;
  }

  toString() {
    return `Blob: ${this.name} with checksum ${this.checksum}`;
  }

  slice() {
    return this.file.slice();
  }

  static build(file) {
    return new EmberPromise((resolve, reject) => {
      FileChecksum.MD5(file).then(
        (checksum) => {
          const blob = new Blob(file, checksum);
          resolve(blob);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}
