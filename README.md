# ember-active-storage

[![CI](https://github.com/algonauti/ember-active-storage/workflows/CI/badge.svg)](https://github.com/algonauti/ember-active-storage/actions)
[![Ember Observer Score](https://emberobserver.com/badges/-algonauti-ember-active-storage.svg)](https://emberobserver.com/addons/@algonauti/ember-active-storage)

## Installation

```
ember install @algonauti/ember-active-storage
```

## Usage

The addon provides an `activeStorage` service that allows you to:

- send files to your Rails backend's direct upload controller;
- listen to upload progress events.

Assuming your template has a file input like:

```hbs
<input type="file" {{on "change" (fn this.upload)}} />
```

and your ember model has an `avatar` attribute defined as `has_one_attached :avatar` on its corresponding Active Record model, then in your component (or controller) the `upload` action would look like:

```javascript
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class UploadComponent extends Component {
  @service
  activeStorage;

  @tracked
  uploadProgress = 0;

  @action
  upload(event) {
    const files = event.target.files;
    if (files) {
      const directUploadURL = '/rails/active_storage/direct_uploads';

      for (var i = 0; i < files.length; i++) {
        this.activeStorage
          .upload(files.item(i), directUploadURL, {
            onProgress: (progress, event) => {
              this.uploadProgress = progress;
            },
          })
          .then((blob) => {
            const signedId = blob.signedId;

            this.model.avatar = signedId;
          });
      }
    }
  }
}
```

- `directUploadURL` is the path referencing `ActiveStorage::DirectUploadsController` on your Rails backend (or a custom one built on top of that).
- The `uploadProgress` property will hold a value between 0 and 100 that you might use in your template to show upload progress.
- After the `upload` promise is resolved and `signedId` is set in your model, when a `model.save()` is triggered, the Rails backend will use such `signedId` to associate an `ActiveStorage::Attachment` record to your backend model's record.

---

`loadstart`, `load`, `loadend`, `error`, `abort`, `timeout` events invokes `onLoadstart`, `onLoad`, `onLoadend`, `onError`, `onAbort`, `onTimeout` accordingly. For example; If you want to use the `loadend` event in your app, you can use like;

```javascript
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class UploadComponent extends Component {
  @service
  activeStorage;

  @tracked
  uploadProgress = 0;

  @action
  upload(event) {
    const files = event.target.files;
    if (files) {
      const directUploadURL = '/rails/active_storage/direct_uploads';

      for (var i = 0; i < files.length; i++) {
        this.activeStorage
          .upload(files.item(i), directUploadURL, {
            onProgress: (progress, event) => {
              this.uploadProgress = progress;
            },
            onLoadend: (event) => {
              debug(`Event captured ${event}`); // https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent
            },
          })
          .then((blob) => {
            const signedId = blob.signedId;

            this.model.avatar = signedId;
          });
      }
    }
  }
}
```

If you need the actual `XHR object` in your app, you can use the `onXHROpened` event. It returns the `XHR object` reference. For example:

```javascript
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class UploadComponent extends Component {
  @service
  activeStorage;

  @tracked
  uploadProgress = 0;
  
  @tracked
  xhrs = [];

  @action
  upload(event) {
    const files = event.target.files;
    if (files) {
      const directUploadURL = '/rails/active_storage/direct_uploads';

      for (var i = 0; i < files.length; i++) {
        this.activeStorage
          .upload(files.item(i), directUploadURL, {
            onProgress: (progress, event) => {
              this.uploadProgress = progress;
            },
            onXHROpened: (xhr) => {
              this.xhrs.push(xhr);  // so you can loop over this.xhrs and invoke abort()
            },
          })
          .then((blob) => {
            const signedId = blob.signedId;

            this.model.avatar = signedId;
          });
      }
    }
  }
}
```

There is an `ember-active-storage` ENV config with only one parameter called `url`. With this config help, you can omit the upload url now. For example:

```javascript
ENV['ember-active-storage'] = {
  url: 'http://your-domain/rails/active_storage/direct_uploads',
};
```

Now you can call the upload function without the upload url.

```javascript
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class UploadComponent extends Component {
  @service
  activeStorage;

  @tracked
  uploadProgress = 0;

  @action
  upload(event) {
    const files = event.target.files;
    if (files) {
      for (var i = 0; i < files.length; i++) {
        this.activeStorage
          .upload(files.item(i), {
            onProgress: (progress, event) => {
              this.uploadProgress = progress;
            },
          })
          .then((blob) => {
            const signedId = blob.signedId;

            this.model.avatar = signedId;
          });
      }
    }
  }
}
```

### Sending authentication headers

It's pretty common that you want to protect with authentication the direct uploads endpoint on your Rails backend. If that's the case, the `activeStorage` service will need to send authentication headers together with the direct upload request.

To achieve that, you'll need to extend the `activeStorage` service provided by the addon and add a `headers` computed property. For example, if you're using [ember-simple-auth](/simplabs/ember-simple-auth), it will be a 2-steps process. First you'll need to define an `authenticatedHeaders` computed property in your `session` service, like this:

```javascript
// app/services/session.js
import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class MySessionService extends Service {
  @service
  session;

  get authenticatedHeaders() {
    const { access_token } = this.session.authenticated;

    return { Authorization: `Bearer ${access_token}` };
  }
}
```

Then, you will alias that property in your `activeStorage` service, like this:

```javascript
// app/services/active-storage.js
import ActiveStorage from '@algonauti/ember-active-storage/services/active-storage';
import { inject as service } from '@ember/service';

export default class ActiveStorageService extends ActiveStorage {
  @service('my-session')
  session;

  get headers() {
    this.session.authenticatedHeaders;
  }
}
```

Also note: if the download endpoint is protected as well, and you're using an ajax request to download files, then don't forget to include the same headers in that request as well.

## Contributing

### Installation

- `git clone <repository-url>`
- `cd ember-active-storage`
- `yarn install`

### Linting

- `yarn lint:js`
- `yarn lint:js --fix`

### Running tests

- `ember test` – Runs the test suite on the current Ember version
- `ember test --server` – Runs the test suite in "watch mode"
- `yarn test` – Runs `ember try:each` to test your addon against multiple Ember versions

### Running the dummy application

- `ember serve`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## License

This project is licensed under the [MIT License](LICENSE.md).
