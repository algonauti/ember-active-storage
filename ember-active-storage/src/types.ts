/**
 * Plain object of HTTP headers sent with a request.
 */
export type Headers = Record<string, string>;

/**
 * Optional `ENV['ember-active-storage']` configuration.
 */
export interface ActiveStorageConfig {
  /** Default direct upload URL used when `upload()` is called without one. */
  url?: string;
}

/**
 * Where and how the file is uploaded to the storage service,
 * as returned by the Rails direct uploads controller.
 */
export interface DirectUploadData {
  headers: Headers;
  url: string;
}

/**
 * JSON returned by `ActiveStorage::DirectUploadsController#create`.
 */
export interface DirectUploadResponse {
  byte_size: number;
  checksum: string;
  content_type: string;
  created_at: string;
  direct_upload: DirectUploadData;
  filename: string;
  id: number;
  key: string;
  metadata: Record<string, unknown>;
  signed_id: string;
}

/**
 * Callbacks for the XHR events fired while the file is uploaded.
 * See https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent
 */
export interface UploadEventHandlers {
  onAbort?: (event: ProgressEvent) => void;
  onError?: (event: ProgressEvent) => void;
  onLoad?: (event: ProgressEvent) => void;
  onLoadend?: (event: ProgressEvent) => void;
  onLoadstart?: (event: ProgressEvent) => void;
  /** Called with a value between 1 and 100. */
  onProgress?: (progress: number, event: ProgressEvent) => void;
  onTimeout?: (event: ProgressEvent) => void;
  /** Called with every XHR the addon opens, so it can be aborted. */
  onXHROpened?: (xhr: XMLHttpRequest) => void;
}

/**
 * Options accepted by `ActiveStorageService#upload`.
 */
export interface UploadOptions extends UploadEventHandlers {
  /** Extra information stored on the blob by Active Storage. */
  metadata?: Record<string, unknown>;
}

/**
 * Options accepted by the internal XHR request helper.
 */
export interface RequestOptions {
  contentType?: string;
  data?: Document | null | XMLHttpRequestBodyInit;
  dataType?: 'json' | 'text';
  headers?: Headers;
  method?: string;
}

/**
 * Options to customise the response built by `uploadResponse` (test helper).
 */
export interface UploadResponseOptions {
  directUploadURL?: string;
  id?: number;
  key?: string;
  signedId?: string;
}

/**
 * Headers and body of the mocked direct upload response built by `uploadResponse`.
 */
export interface UploadResponse {
  body: DirectUploadResponse;
  headers: Headers;
}
