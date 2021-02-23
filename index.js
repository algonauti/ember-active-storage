'use strict';

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);
    this.importDependencies();
  },

  importDependencies() {
    this.import(
      {
        development: 'node_modules/spark-md5/spark-md5.js',
        production: 'node_modules/spark-md5/spark-md5.min.js',
      },
      { prepend: true }
    );
  },
};
