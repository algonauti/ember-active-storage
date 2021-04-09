import { isPresent } from '@ember/utils';
import { Promise } from 'rsvp';

export default function (url, options) {
  return new Promise((resolve, reject) => {
    let xhr = options.xhr ? options.xhr() : new XMLHttpRequest();

    xhr.open(options.method || 'GET', url);

    if (options.headers) {
      Object.keys(options.headers).forEach((key) => {
        xhr.setRequestHeader(key, options.headers[key]);
      });
    }
    if (options.contentType) {
      xhr.setRequestHeader('Content-Type', options.contentType);
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let response;
        if (options.dataType === 'text') {
          response = xhr.responseText;
        } else if (isPresent(xhr.responseText)) {
          response = JSON.parse(xhr.responseText);
        }
        resolve(response);
      } else {
        reject(xhr.statusText);
      }
    };

    xhr.onerror = () => reject(xhr.statusText);

    if (options.abort) {
      if (xhr.readyState !== 0) {
        xhr.abort();
      }
    } else {
      xhr.send(options.data);
    }
  });
}
