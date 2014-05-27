var IndexController = Ember.Controller.extend({
  queryParams: ['search', 'day', 'category'],
  search: null,
  day: null,
  category: null,
  text: 'indexController'
});

export default IndexController;
