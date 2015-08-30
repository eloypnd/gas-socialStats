var App = (function () {

  var twitter = new Twitter();
  var sheetCrud = new SheetCrud(config.sheets);

  var AppClass = function (config) {
    //TODO: check everything is ok to startup app
    if (!twitter || !sheetCrud) { /* Log whatever and stop */ }
  }

  AppClass.prototype.followers = function () {
    sheetCrud.get('followers');
    sheetCrud.merge('followers', twitter.getFollowers());
  };

  return AppClass;

})();
