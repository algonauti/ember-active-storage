import { setProperties } from '@ember/object';
import { run } from '@ember/runloop';
import type Blob from '../model/blob.ts';
import type {
  DirectUploadResponse,
  Headers,
  UploadEventHandlers,
} from '../types.ts';
import request from './request.ts';

type XhrEventName =
  'abort' | 'error' | 'load' | 'loadend' | 'loadstart' | 'timeout';

const XHR_EVENT_HANDLERS = {
  abort: 'onAbort',
  error: 'onError',
  load: 'onLoad',
  loadend: 'onLoadend',
  loadstart: 'onLoadstart',
  timeout: 'onTimeout',
} as const satisfies Record<XhrEventName, keyof UploadEventHandlers>;

export interface UploaderOptions extends UploadEventHandlers {
  headers?: Headers;
  metadata?: Record<string, unknown>;
}

export default class Uploader {
  events: UploadEventHandlers;
  headers?: Headers;
  metadata?: Record<string, unknown>;

  constructor({ headers, metadata, ...events }: UploaderOptions) {
    this.headers = headers;
    this.metadata = metadata;
    this.events = events;
  }

  private addCreatedListener(xhr: XMLHttpRequest): void {
    xhr.addEventListener('XHROpened', (event) => {
      this.events.onXHROpened?.((event as CustomEvent<XMLHttpRequest>).detail);
    });
  }

  private addListeners(xhr: XMLHttpRequest): void {
    (Object.keys(XHR_EVENT_HANDLERS) as XhrEventName[]).forEach((name) => {
      xhr.addEventListener(name, (event) => {
        this.handleEvent(name, event);
      });
    });
  }

  private blobUpdate(blob: Blob, response: DirectUploadResponse): void {
    setProperties(blob, {
      directUploadData: response.direct_upload,
      id: response.id,
      key: response.key,
      signedId: response.signed_id,
    });
  }

  private blobUpload(blob: Blob): Promise<string> {
    const xhr = new XMLHttpRequest();

    this.addListeners(xhr);
    this.addCreatedListener(xhr);
    xhr.upload.addEventListener('progress', (event) => {
      this.uploadRequestDidProgress(event);
    });

    const { headers, url } = blob.directUploadData!;

    return request<string>(xhr, url, {
      data: blob.slice(),
      dataType: 'text',
      headers,
      method: 'PUT',
    });
  }

  private directUpload(blob: Blob, url: string): Promise<DirectUploadResponse> {
    const xhr = new XMLHttpRequest();

    this.addCreatedListener(xhr);

    return request<DirectUploadResponse>(xhr, url, {
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        blob: {
          byte_size: blob.size,
          checksum: blob.checksum,
          content_type: blob.type,
          filename: blob.name,
          metadata: this.metadata,
        },
      }),
      headers: this.headers,
      method: 'POST',
    });
  }

  private handleEvent(name: XhrEventName, event: ProgressEvent): void {
    this.events[XHR_EVENT_HANDLERS[name]]?.(event);
  }

  async upload(blob: Blob, url: string): Promise<Blob> {
    const response = await this.directUpload(blob, url);

    this.blobUpdate(blob, response);
    await this.blobUpload(blob);

    return blob;
  }

  private uploadRequestDidProgress(event: ProgressEvent): void {
    const progress = Math.ceil((event.loaded / event.total) * 100);

    if (progress) {
      // eslint-disable-next-line ember/no-runloop
      run(() => this.events.onProgress?.(progress, event));
    }
  }
}
