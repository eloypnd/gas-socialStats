var Archive = (function () {
  // >>>> PRIVATE PROPERTIES <<<<
  var _spreadsheet = SpreadsheetApp.getActive();

  var _sheets = {};
  var _data = {};
  var _indexes = {};

  var _sheetsDesc = {
    followers: {
      name: 'followers',
      definition: 'twitterUser',
      displayName: 'screen_name',
      index: 'id_str'
    },
    following: {
      name: 'following',
      definition: 'twitterUser',
      displayName: 'screen_name',
      index: 'id_str'
    },
    twitterStats: {
      name: 'twitterStats',
      definition: 'twitterStats'
    },
    logs: {
      name: 'logs',
      definition: 'log'
    }
  };

  var _definitions = {
    twitterStats: [
      'created_at',
      'event', // events: follower, unfollower, following, unfollowing
      'user_id',
      'screen_name'
    ],
    log: [
      'created_at',
      'level', // trace, debug, info, warn, error
      'message'
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
    Object.keys(_sheetsDesc).forEach(function (sheetName) {
      _sheets[sheetName] = _spreadsheet.getSheetByName(sheetName);
      if (!_sheets[sheetName]) {
        Logger.log('INFO: Sheet `%s` doesn\'t exist. Creating new sheet', sheetName);
        _sheets[sheetName] = _createSheet(sheetName);
      }
    });
  };
  /**
   * `get()` function load the sheet and return a JSON object
   *
   * @param String sheetName
   *
   * @return void
   */
  ArchiveClass.prototype.get = function (sheetName) {
    if (typeof sheetName === 'undefined') return false;
    if (typeof _sheetsDesc[sheetName] === 'undefined') return false;
    var definition = _definitions[_sheetsDesc[sheetName].definition];
    var range = _sheets[sheetName].getDataRange();
    var data = range.getValues();

    if (!_data[sheetName]) {
      var index = (_sheetsDesc[sheetName].index) ?
                    definition.indexOf(_sheetsDesc[sheetName].index)
                  : undefined;
      _data[sheetName] = [];
      _indexes[sheetName] = (index) ? [] : undefined;
      for (var i = 1; i < data.length; i++) {
        _data[sheetName].push(_sheetToJson(data[i], definition));
        if (index) { _indexes[sheetName].push(data[i][index].toString()); }
      }
    }
    return _data[sheetName];
  };
  ArchiveClass.prototype.set = function (sheetName, data) {
    if (typeof sheetName === 'undefined') return false;
    if (typeof _sheetsDesc[sheetName] === 'undefined') return false;
    if (typeof data === 'undefined') return false;
    var definition = _definitions[_sheetsDesc[sheetName].definition];

    //TODO: validate data with sheet definition
    for (var i = 0; i < _data[sheetName].length; i++) {
      _sheets[sheetName].appendRow(_jsonToSheet(data[i], definition));
    }
  };
  /**
   * `ArchiveClass.prototype.merge()`
   *
   * @param String sheetName
   * @param Array data
   *
   * @return void
   */
  ArchiveClass.prototype.merge = function (sheetName, data) {
    if (typeof sheetName === 'undefined') return false;
    if (typeof data === 'undefined') return false;
    if (typeof _indexes[sheetName] === 'undefined') return false;
    var data_copy = JSON.parse(JSON.stringify(_indexes[sheetName]));

    data.forEach(function (row, key) {
      var index = _indexes[sheetName].indexOf(row[_sheetsDesc[sheetName].index]);
      if (index === -1) {
        _data[sheetName].push(row);
        _log('add ' + sheetName, row[_sheetsDesc[sheetName].displayName]);
      } else {
        delete data_copy[index];
      }
    });
    data_copy.forEach(function (rowToDelete, key) {
      _log('delete ' + sheetName, _data[sheetName][key][_sheetsDesc[sheetName].displayName]);
      delete _data[sheetName][key];
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
  function _createSheet(name) {
    if (typeof name !== 'string') return false;

    var tmp_sheet = _spreadsheet.insertSheet(name).appendRow(_definitions[_sheetsDesc[name].definition])
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
   * `_jsonToSheet()` function gets a row from the spreadsheet and transform
   * it into a JSON object
   *
   * @param Array data
   * @param Array definition
   *
   * @return Object
   */
  function _jsonToSheet(data, definition) {
    if (typeof data === 'undefined') return false;
    if (typeof definition === 'undefined') return false;

    //TODO: validate data with definition
    return definition.map(function (field, index) {
      return data[field];
    });
  };
  /**
   * `_sheetToJson()` function gets a row from the spreadsheet and transform
   * it into a JSON object
   *
   * @param Array data
   * @param Array definition
   *
   * @return Object
   */
  function _sheetToJson(data, definition) {
    if (typeof data === 'undefined') return false;
    if (typeof definition === 'undefined') return false;
    var tmp = {};
    if (data.length !== definition.length) {
      Logger.log('ERROR in `Archive._sheetToJson()`: row need to has %s fields but it only has %s',
        data.length, definition.length);
      return false;
    }
    definition.forEach(function (field, index) {
      tmp[field] = data[index].toString();
    });
    return tmp;
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
