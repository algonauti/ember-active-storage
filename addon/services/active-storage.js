import Service from '@ember/service';
import Mixin from '@ember/object/mixin';
import { getOwner } from '@ember/application';

import Uploader from 'ember-active-storage/-private/uploader';
import Blob from 'ember-active-storage/model/blob';

export default Service.extend({

  upload(file, url, mixin) {
    const uploader = Uploader.extend(Mixin.create(mixin)).create(
      getOwner(this).ownerInjection(),
    );

    Blob.build(file).then( (blob) => {
      uploader.upload(blob, url)
    });
  }

});
