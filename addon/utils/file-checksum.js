import EmberObject from '@ember/object';
import { Promise as EmberPromise } from 'rsvp';

export default EmberObject.extend({
  init() {
    this._super(...arguments);

    this.chunkSize = 2097152; // 2MB
    this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
    this.chunkIndex = 0;
  },

  createMD5() {
    return new EmberPromise((resolve, reject) => {
      this.md5Buffer = new SparkMD5.ArrayBuffer;
      this.fileReader = new FileReader;

      this.fileReader.onload = (event) => {
        this.md5Buffer.append(event.target.result);

        if (!this.readNextChunk()) {
          const binaryDigest = this.md5Buffer.end(true);
          const base64digest = btoa(binaryDigest);
          resolve(base64digest);
        }
      };

      this.fileReader.onerror = (error) => {
        reject(error);
      };

      this.readNextChunk();
    });
  },

  readNextChunk() {
    let fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice

    if (this.chunkIndex < this.chunkCount) {
      const start = this.chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.file.size);
      const bytes = fileSlice.call(this.file, start, end);
      this.fileReader.readAsArrayBuffer(bytes);
      this.chunkIndex++;
      return true;
    } else {
      return false;
    }
  }
}).reopenClass({
  MD5(file) {
    return this.create({ file: file }).createMD5();
  }
});
