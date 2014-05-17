
//import testContext from 'ember-qunit/test-context';

moduleForModel('category', 'model: category', {

  setup: function(container) {
    container.register('adapter:application', DS.RESTAdapter);
  },
  teardown: function() {
    if ( window.App ) { 
      App.reset();
    }
  }
});
/*
test('can set and get category name', function() {
  expect(1);
  var ctrl = this.subject();
  Em.run(function() {
    ctrl.set('name', 'ppcano');
  });
  equal(ctrl.get('name'), 'ppcano');
});
*/


test('can query ', function() {
  expect(1);
    
  var store = this.store();
  $.mockjax({
    url:  '/categories',
    dataType: 'json',
    responseText: {
      categories:[{ id: 1, name:'Keay'},
             { id: 2, name:'oooo' }]
  }});


  stop();
  store.find('category').then(function(categories) {
    
    equal(categories.get('length'), 2);
    start();
  });
});
