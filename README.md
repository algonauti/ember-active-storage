ember-active-storage
==============================================================================

[![Build Status](https://travis-ci.org/algonauti/ember-active-storage.svg?branch=master)](https://travis-ci.org/algonauti/ember-active-storage)


Installation
------------------------------------------------------------------------------

```
ember install ember-active-storage
```


Usage
------------------------------------------------------------------------------

The addon provides an `activeStorage` service that allows you to:

- send files to your Rails backend's direct upload controller;
- listen to upload progress events.

Assuming your template has a file input like:

```hbs
<input type="file" onchange={{action "upload"}} />
```

and your ember model has an `avatar` attribute defined as `has_one_attached :avatar` on its corresponding Active Record model, then in your component (or controller) the `upload` action would look like:

```javascript
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';

export default Component.extend({
  activeStorage: service(),

  uploadProgress: 0,

  actions: {
    upload(event) {
      const files = event.target.files;
      if (files) {
        const directUploadURL = '/rails/active_storage/direct_uploads';
        for (var i = 0; i < files.length; i++) {
          get(this, 'activeStorage').upload(files.item(i), directUploadURL, {
            onProgress: (progress) => {
              set(this, 'uploadProgress', progress);
            }
          }).then( (blob) => {
            const signedId = get(blob, 'signedId');
            let model = get(this, 'model');
            set(model, 'avatar', signedId);
          });
        }
      }
    }
  }
});

```

- `directUploadURL` is the path referencing `ActiveStorage::DirectUploadsController` on your Rails backend (or a custom one built on top of that).
- The `uploadProgress` property will hold a value between 0 and 100 that you might use in your template to show upload progress.
- After the `upload` promise is resolved and `signedId` is set in your model, when a `model.save()` is triggered, the Rails backend will use such `signedId` to associate an `ActiveStorage::Attachment` record to your backend model's record.


### Sending authentication headers

It's pretty common that you want to protect with authentication the direct uploads endpoint on your Rails backend. If that's the case, the `activeStorage` service will need to send authentication headers together with the direct upload request.

To achieve that, you'll need to extend the `activeStorage` service provided by the addon and add a `headers` computed property. For example, if you're using [ember-simple-auth](/simplabs/ember-simple-auth) it would look like:

```javascript
// app/services/active-storage.js
import ActiveStorage from 'ember-active-storage/services/active-storage';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { get } from '@ember/object';

export default ActiveStorage.extend({

  session: service(),

  headers: computed('session.isAuthenticated', function() {
    var headers = {};
    get(this, 'session').authorize('authorizer:application', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });
    return headers;
  })

});
```


Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-active-storage`
* `yarn install`

### Linting

* `yarn lint:js`
* `yarn lint:js --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `yarn test` – Runs `ember try:each` to test your addon against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
