var AccountRoute = Ember.Route.extend({

  model: function(params) {
    console.log(params);
  },

  activate: function() {

    var c = this.controllerFor('index');
    c.set('search', 'casa');

  },

  actions: {
    goToIndex: function() {
      this.transitionTo('index', {queryParams: {category: 3, search:null}});

    }

  }

});

export default AccountRoute;
