var Twitter = (function () {

  // >>>> PRIVATE PROPERTIES <<<<
  var _scriptProperties = PropertiesService.getScriptProperties();
  var projectKey = ScriptApp.getProjectKey();
  var consumerKey = _scriptProperties.getProperty("twitterConsumerKey");
  var consumerSecret = _scriptProperties.getProperty("twitterConsumerSecret");

  var _twitterService = {};
  var _followers = [];

  /**
   * Constructor
   */
  var TwitterClass = function () {
    _setupService();
  }

  TwitterClass.prototype.fetch = function(endpoint, params) {
    if (_twitterService.hasAccess()) {
      var response = _twitterService.fetch(_getUrl(endpoint, params));
      return JSON.parse(response.getContentText());
    } else {
      var authorizationUrl = _twitterService.authorize();
      Logger.log('Please visit the following URL and then re-run the script: ' + authorizationUrl);
    }
  }
  TwitterClass.prototype.authCallback = function (request) {
    var isAuthorized = _twitterService.handleCallback(request);
    if (isAuthorized) {
      return HtmlService.createHtmlOutput('Success! You can close this page.');
    } else {
      return HtmlService.createHtmlOutput('Denied. You can close this page');
    }
  }
  TwitterClass.prototype.getFollowers = function (screen_name) {
    if (typeof screen_name !== 'undefined') options.screen_name = screen_name;

    if (_followers.length === 0) {
      var options = {
        count: 200,
        cursor: -1
      };

      do {
        var response = this.fetch('followers/list.json', options);
        response.users.forEach(function (user) {
          // process all the followers in this response
          _followers.push(user);
        });
        options.cursor = response.next_cursor;
      } while (options.cursor !== 0);
    }
    return _followers;
  }

  // >>>> PRIVATE METHODS <<<<

  /**
   * Oauth conf.
   */
  function _setupService() {
    _twitterService = OAuth1.createService('twitter');
    _twitterService.setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
    _twitterService.setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
    _twitterService.setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
    _twitterService.setConsumerKey(consumerKey);
    _twitterService.setConsumerSecret(consumerSecret);
    _twitterService.setProjectKey(projectKey);
    _twitterService.setCallbackFunction('authCallback');
    _twitterService.setPropertyStore(_scriptProperties);
    return _twitterService;
  }

  function _getUrl(endpoint, params) {
    // endpoint is required argument
    if (typeof endpoint === 'undefined') return false;
    // params is optional. empty object by default
    params = typeof params !== 'undefined' ? params : {};

    var apiUrl = 'https://api.twitter.com/1.1/';

    var i = 0;
    for (var param in params) {
      if (i === 0) {
        endpoint = endpoint + '?' + param + '=' + params[param];
      } else {
        endpoint = endpoint + '&' + param + '=' + params[param];
      }
      i++;
    }
    return apiUrl + endpoint;
  }

  return TwitterClass;
})();

/**
 * authCallback(). Just an alias for `Twitter.authCallback`, so it can be reached
 * directly from outside
 */
function authCallback(request) {
  var twitter = new Twitter();
  twitter.authCallback(request);
}
