import type ApplicationInstance from '@ember/application/instance';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/owner';
import Service from '@ember/service';
import { isPresent, typeOf } from '@ember/utils';
import Uploader from '../-private/uploader.ts';
import Blob from '../model/blob.ts';
import type { ActiveStorageConfig, Headers, UploadOptions } from '../types.ts';

const MISSING_URL_MESSAGE =
  "If not explicitly passed, URL must be set on ENV['ember-active-storage'] = { url: '...' }";

export default class ActiveStorageService extends Service {
  /**
   * Headers sent with the direct upload request.
   * Override it in your own service to send authentication headers.
   */
  declare headers?: Headers;

  private get config(): ActiveStorageConfig {
    const owner = getOwner(this) as ApplicationInstance | undefined;
    const config = owner?.resolveRegistration('config:environment') as
      Record<string, ActiveStorageConfig | undefined> | undefined;

    return config?.['ember-active-storage'] ?? {};
  }

  upload(file: File, options?: UploadOptions): Promise<Blob>;
  upload(file: File, url: string, options?: UploadOptions): Promise<Blob>;
  async upload(
    file: File,
    urlOrOptions?: string | UploadOptions,
    options: UploadOptions = {},
  ): Promise<Blob> {
    let url: string;

    if (isPresent(urlOrOptions)) {
      if (typeOf(urlOrOptions) == 'string') {
        url = urlOrOptions as string;
      } else {
        assert(MISSING_URL_MESSAGE, isPresent(this.config['url']));

        options = urlOrOptions as UploadOptions;
        url = this.config['url']!;
      }
    } else {
      assert(MISSING_URL_MESSAGE, isPresent(this.config['url']));

      url = this.config['url']!;
    }

    const { metadata, ...callbacks } = options;

    const uploader = new Uploader({
      headers: this.headers,
      metadata,
      ...callbacks,
    });

    const blob = await Blob.build(file);

    return uploader.upload(blob, url);
  }
}

declare module '@ember/service' {
  interface Registry {
    'active-storage': ActiveStorageService;
  }
}
