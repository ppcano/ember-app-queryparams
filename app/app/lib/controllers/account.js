var AccountController = Ember.ObjectController.extend({
  needs: ['index'],
  search: Em.computed.alias('controllers.index.search'),
  testValue: 'ppcano'
});

export default AccountController;
