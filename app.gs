var App = (function () {

  var twitter = new Twitter();
  var sheetCrud = new SheetCrud(config.sheets);

  var AppClass = function (config) {
    //TODO: check everything is ok to startup app
    if (!twitter || !sheetCrud) { /* Log whatever and stop */ }
  }

  AppClass.prototype.followers = function () {
    sheetCrud.append('logs', {
      created_at: new Date(),
      level: 'info',
      message: 'Start hourly followers track.'
    });
    sheetCrud.get('followers');
    sheetCrud.merge('followers', twitter.getFollowers(), function (action, elem) {
      Logger.log('%s: %s', action, elem.screen_name);
      sheetCrud.append('twitterStats', {
        created_at: new Date(),
        event: action,
        user_id: elem.id_str,
        screen_name: elem.screen_name
      });
    });
    sheetCrud.save('followers');
    sheetCrud.append('logs', {
      created_at: new Date(),
      level: 'info',
      message: 'Finish hourly followers track.'
    });
  };

  return AppClass;

})();
