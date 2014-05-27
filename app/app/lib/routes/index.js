var IndexRoute = Ember.Route.extend({

  //https://github.com/emberjs/ember.js/pull/4571
  queryParams: {
    category: {
      //reset: true,
      refreshModel: true
    },
    search: {
      //reset: true,
      refreshModel: true
    },
    day: {
      //reset: true,
      refreshModel: true
    }
  },
  model: function(params){

    console.log(params);
    console.log('hook: index model');
      //return Ember.RSVP.reject('index error');
  },

  deactivate: function() {


  },

  actions: {
    error: function(error) {
      console.log('ERROR INDEX HANDLING-------------------------');
      console.log(error);
      console.log('--------------------------------------');
    },
    changeSearch: function() {
      
      var c = this.controller;
      var search = c.get('search');
      search = (search) ? null : 'ppcano';

      c.set('search', search);

    }

  }
});

export default IndexRoute;
