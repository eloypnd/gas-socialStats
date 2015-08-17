var Archive = (function () {
  // >>>> PRIVATE PROPERTIES <<<<
  var _spreadsheet = SpreadsheetApp.getActive();
  var _followersSheet = _spreadsheet.getSheetByName("followers");
  var _followingSheet = _spreadsheet.getSheetByName("following");
  var _logSheet = _spreadsheet.getSheetByName("logs");

  var _followers = [];
  var _followers_id = [];

  var _definitions = {
    logs: [
      'created_at',
      'event', // events: follower, unfollower, following, unfollowing
      'user_id',
      'screen_name'
    ],
    twitterUser: [
      'id',
      'id_str',
      'name',
      'screen_name',
      'location',
      'profile_location',
      'description',
      'url',
      'protected',
      'followers_count',
      'friends_count',
      'listed_count',
      'created_at',
      'favourites_count',
      'utc_offset',
      'time_zone',
      'geo_enabled',
      'verified',
      'statuses_count',
      'lang',
      'contributors_enabled',
      'is_translator',
      'is_translation_enabled',
      'profile_background_color',
      'profile_background_image_url',
      'profile_background_image_url_https',
      'profile_background_tile',
      'profile_image_url',
      'profile_image_url_https',
      'profile_link_color',
      'profile_sidebar_border_color',
      'profile_sidebar_fill_color',
      'profile_text_color',
      'profile_use_background_image',
      'has_extended_profile',
      'default_profile',
      'default_profile_image',
      'following',
      'follow_request_sent',
      'notifications',
      'muting',
      'blocking',
      'blocked_by'
    ]
  };

  /**
   * Constructor
   */
  var ArchiveClass = function () {
    if (!_followersSheet) {
      Logger.log('ERROR: Missing `followers` sheet');
      _followersSheet = _createSheet('followers');
    }
    if (!_followingSheet) {
      Logger.log('ERROR: Missing `following` sheet');
      //TODO: create `following` sheet if it doesn't exits
    }
    if (!_logSheet) {
      Logger.log('ERROR: Missing `logs` sheet');
      //TODO: create `logs` sheet if it doesn't exits
    }
  };
  /**
   * `getFollowers()` function load the users from the spreadsheet into the `_followers` property
   *
   * @return void
   */
  ArchiveClass.prototype.getFollowers = function () {
    var range = _followersSheet.getDataRange();
    var data = range.getValues();
    var id_index = _definitions['twitterUser'].indexOf('id');

    if (_followers.length === 0) {
      for (var i = 1; i < data.length; i++) {
        _followers.push(_userSheetToJson(data[i], i+1));
        _followers_id.push(data[i][id_index].toString());
      }
    }
    return _followers;
  };
  ArchiveClass.prototype.setFollowers = function (followers) {
    if (typeof followers === 'undefined') return false;

    for (var i = 0; i < followers.length; i++) {
      _followersSheet.appendRow(_userJsonToSheet(followers[i]));
    }
  };
  ArchiveClass.prototype.mergeFollowers = function (followers) {
    if (typeof followers === 'undefined') return false;
    var _followers_copy = JSON.parse(JSON.stringify(_followers));

    followers.forEach(function (user, index) {
      var is_user = _followers_id.indexOf(user.id_str);
      if (is_user === -1) {
        _followers.push(user);
        _log('new follower', user.screen_name);
      } else {
        delete _followers_copy[index];
      }
    });
    _followers_copy.forEach(function (unfollower, index) {
      Logger.log('@%s is not following you anymore', unfollower.screen_name);
      delete _followers[index];
      _log('unfollower', unfollower.screen_name);
      //_followers.splice(index, 1);
    });
  };

  // >>>> PRIVATE METHODS <<<<

  /**
   * `_createSheet()` function create a sheet in the active spreadsheet
   *
   * @param String name
   * @param Array headers
   *
   * @return Sheet
   */
  function _createSheet(name, headers) {
    if ((typeof name !== 'string') || (!headers instanceof Array)) return false;

    var tmp_sheet = _spreadsheet.insertSheet(name).appendRow(_definitions['twitterUser'])
    tmp_sheet.setFrozenRows(1);
    return tmp_sheet;
  }
  /**
   * `_getRow()` function gets a row from the spreadsheet and transform
   *
   * @param Integer rowIndex
   * @param Sheet sheet
   *
   * @return Array
   */
  function _getRow(rowIndex, sheet) {
    if (typeof rowIndex === 'undefined') return false;
    if (typeof sheet === 'undefined') return false;

    return sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  }
  /**
   * `_getRow()` function gets a row from the spreadsheet and transform
   *
   * @param Integer rowIndex
   * @param Sheet sheet
   *
   * @return Array
   */
  function _setRow(rowIndex, sheet, values) {
    if ((typeof rowIndex === 'undefined') ||
        (typeof sheet === 'undefined') ||
        (!values instanceof Array)) return false;
    if (values.length !== sheet.getLastColumn()) {
      Logger.log('ERROR in `Archive._setRow()`: Sheet %s has %s columns while new row has %s columns',
        sheet.getName(), sheet.getLastColumn(), values.length);
      return false;
    }
    return sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).setValues([values]);
  }
  /**
   * `_userSheetToJson()` function gets a row from the spreadsheet and transform
   * it into a JSON object
   *
   * @param Array user
   *
   * @return Object
   */
  function _userSheetToJson(user, sheet_index) {
    if (typeof user === 'undefined') return false;
    var tmp_user = {sheet_index: sheet_index};
    if (user.length !== _definitions['twitterUser'].length) {
      Logger.log('ERROR in `Archive._userSheetToJson()`: user need to has %s fields but it only has %s',
        user.length, _definitions['twitterUser'].length);
    }
    _definitions['twitterUser'].forEach(function (elem, index, array) {
      tmp_user[elem] = user[index].toString();
    });
    return tmp_user;
  };
  /**
   * `_userJsonToSheet()` function gets a row from the spreadsheet and transform
   * it into a JSON object
   *
   * @param Array user
   *
   * @return Object
   */
  function _userJsonToSheet(user) {
    if (typeof user === 'undefined') return false;
    var tmp_user = [];
    //TODO: validate user object we get as an argument
    _definitions['twitterUser'].forEach(function (elem, index, array) {
      tmp_user.push(user[elem]);
    });
    return tmp_user;
  };
  function _refreshIds() {
    _followers_id = _followers.map(function (user, index) {
      return user.id;
    });
  }
  function _log() {
    for (var i = 0; i < arguments.length; i++) {
      Logger.log('%s: %s', i.toString(), arguments[i]);
    }
  }

  return ArchiveClass;
})();
