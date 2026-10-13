import { tracked } from '@glimmer/tracking';
import type { DirectUploadData } from '../types.ts';
import FileChecksum from '../utils/file-checksum.ts';

export default class Blob {
  // Default Values
  @tracked file: File;
  checksum: string;
  directUploadData: DirectUploadData | null = null;
  id: null | number = null;
  key: null | string = null;
  signedId: null | string = null;

  // Getters
  get name(): string {
    return this.file.name;
  }

  get size(): number {
    return this.file.size;
  }

  get type(): string {
    return this.file.type;
  }

  constructor(file: File, checksum: string) {
    this.file = file;
    this.checksum = checksum;
  }

  static async build(file: File): Promise<Blob> {
    const checksum = await FileChecksum.MD5(file);

    return new Blob(file, checksum);
  }

  slice(): globalThis.Blob {
    return this.file.slice();
  }

  toString(): string {
    return `Blob: ${this.name} with checksum ${this.checksum}`;
  }
}
