import { isPresent } from '@ember/utils';
import type { RequestOptions } from '../types.ts';

export default function request<T = unknown>(
  xhr: XMLHttpRequest,
  url: string,
  options: RequestOptions,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    xhr.open(options.method || 'GET', url);

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    if (options.contentType) {
      xhr.setRequestHeader('Content-Type', options.contentType);
    }

    xhr.onload = (): void => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let response: unknown;

        if (options.dataType === 'text') {
          response = xhr.responseText;
        } else if (isPresent(xhr.responseText)) {
          response = JSON.parse(xhr.responseText);
        }

        resolve(response as T);
      } else {
        reject(new Error(xhr.statusText));
      }
    };

    xhr.onabort = (): void => reject(new Error(xhr.statusText));
    xhr.onerror = (): void => reject(new Error(xhr.statusText));

    xhr.send(options.data);

    xhr.dispatchEvent(new CustomEvent('XHROpened', { detail: xhr }));
  });
}
