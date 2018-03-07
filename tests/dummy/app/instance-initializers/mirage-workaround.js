import Ember from 'ember';
import Service from '@ember/service';

//
// This is a workaround for https://github.com/samselikoff/ember-cli-mirage/issues/1257
//
export function initialize(application) {

  if (Ember.testing) {
    if (!window.server) {
      application.resolveRegistration('initializer:ember-cli-mirage').initialize();
    }

    application.register('service:mirage-workaround', Service.extend({
      willDestroy() {
        window.server.shutdown();
        window.server = null;
        this._super(...arguments);
      }
    }));
    application.lookup('service:mirage-workaround');
  }
}

export default {
  name: 'mirage-workaround',
  initialize
};
