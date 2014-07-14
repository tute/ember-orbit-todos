import Ember from 'ember';
import Orbit from 'orbit';
import LocalStorageSource from 'orbit-common/local-storage-source';
import EO from 'ember-orbit';

var LocalStorageStore = EO.Store.extend({
  orbitSourceClass: LocalStorageSource,
  orbitSourceOptions: {
    namespace: "ember-orbit-todos" // n.s. for localStorage
  }
});

export default {
  name: 'injectStore',
  initialize: function(container, application) {
    Orbit.Promise = Ember.RSVP.Promise;
    application.register('schema:main', EO.Schema);

    application.register('store:main', EO.Store);
    application.register('store:localStorage', LocalStorageStore);
    application.inject('controller', 'store', 'store:main');
    application.inject('route', 'store', 'store:main');

    var memorySource = container.lookup('store:main').orbitSource;
    var localStorageSource = container.lookup('store:localStorage').orbitSource;

    // Warm the cache of the memory store from local storage
    memorySource.reset(localStorageSource.retrieve());

    // Connect MemorySource -> LocalStorageSource (using default blocking
    // strategy)
    new Orbit.TransformConnector(memorySource, localStorageSource);
    new Orbit.TransformConnector(localStorageSource, memorySource);

    memorySource.on('rescueFind', localStorageSource.find);

    // Log transforms
    memorySource.on('didTransform', function(operation) {
      console.log('[ORBIT.JS] [memory]', operation);
    });
    localStorageSource.on('didTransform', function(operation) {
      console.log('[ORBIT.JS] [local]', operation);
    });
  }
};
