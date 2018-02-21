import Service from '@ember/service';
import { inject } from '@ember/service';
import { debug } from '@ember/debug';

export default Service.extend({
  ajax: inject(),

  upload(file, url) {
    debug(`ActiveStorage: upload ${file.name} to url ${url}`)
  }
});
