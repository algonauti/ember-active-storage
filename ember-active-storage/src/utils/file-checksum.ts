import { ArrayBuffer as SparkArrayBuffer } from 'spark-md5';

export default class FileChecksum {
  chunkCount: number;
  chunkIndex = 0;
  chunkSize = 2097152; // 2MB
  file: File;
  fileReader?: FileReader;
  md5Buffer?: SparkArrayBuffer;

  constructor(file: File) {
    this.file = file;
    this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
  }

  createMD5(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const md5Buffer = new SparkArrayBuffer();
      const fileReader = new FileReader();

      this.md5Buffer = md5Buffer;
      this.fileReader = fileReader;

      fileReader.onload = (event): void => {
        md5Buffer.append(event.target!.result as ArrayBuffer);

        if (!this.readNextChunk()) {
          const binaryDigest = md5Buffer.end(true);
          const base64digest = btoa(binaryDigest);

          resolve(base64digest);
        }
      };

      fileReader.onerror = (): void => {
        reject(fileReader.error ?? new Error('Failed to read file'));
      };

      this.readNextChunk();
    });
  }

  static MD5(file: File): Promise<string> {
    return new FileChecksum(file).createMD5();
  }

  readNextChunk(): boolean {
    if (this.chunkIndex < this.chunkCount) {
      const start = this.chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.file.size);
      const bytes = this.file.slice(start, end);

      this.fileReader!.readAsArrayBuffer(bytes);
      this.chunkIndex++;

      return true;
    }

    return false;
  }
}
