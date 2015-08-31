var SheetCrud = (function () {
  // >>>> PRIVATE PROPERTIES <<<<
  var _spreadsheet = SpreadsheetApp.getActive();

  var _sheets = {};
  var _data = {};
  var _indexes = {};

  var _meta = {};

  /**
   * Constructor
   */
  var SheetCrudClass = function (meta) {
    if (typeof meta === 'undefined') {
      _log('error', 'Missing sheets descriptions and definitions when initialising SheetCRUD');
      return false;
    }
    if (typeof meta.descriptions === 'undefined') {
      _log('error', 'Missing sheets descriptions when initialising SheetCRUD');
      return false;
    }
    if (typeof meta.definitions === 'undefined') {
      _log('error', 'Missing sheets definitions when initialising SheetCRUD');
      return false;
    }
    _meta = meta;
    Object.keys(_meta.descriptions).forEach(function (sheetName) {
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
  SheetCrudClass.prototype.get = function (sheetName) {
    if (typeof sheetName === 'undefined') return false;
    if (typeof _meta.descriptions[sheetName] === 'undefined') return false;
    var definition = _meta.definitions[_meta.descriptions[sheetName].definition];
    var range = _sheets[sheetName].getDataRange();
    var data = range.getValues();

    if (!_data[sheetName]) {
      var index = (_meta.descriptions[sheetName].index) ?
                    definition.indexOf(_meta.descriptions[sheetName].index)
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
  /**
   * `SheetCrudClass.prototype.save()`
   *
   * @param String sheetName
   * @param Array data
   *
   * @return void
   */
  SheetCrudClass.prototype.save = function (sheetName) {
    if (typeof sheetName === 'undefined') return false;
    if (typeof _meta.descriptions[sheetName] === 'undefined') return false;
    var definition = _meta.definitions[_meta.descriptions[sheetName].definition];
    _sheets[sheetName].getDataRange().clearContent();
    _sheets[sheetName].appendRow(definition);

    //TODO: validate _data[sheetName] with sheet definition
    for (var i = 0; i < _data[sheetName].length; i++) {
      if (_data[sheetName][i]) {
        _sheets[sheetName].appendRow(_jsonToSheet(_data[sheetName][i], definition));
      }
    }
  };
  /**
   * `SheetCrudClass.prototype.merge()`
   *
   * @param String sheetName
   * @param Array data
   * @param Function cb('add|remove', row)
   *
   * @return void
   */
  SheetCrudClass.prototype.merge = function (sheetName, data, cb) {
    if (typeof sheetName === 'undefined') return false;
    if (typeof data === 'undefined') return false;
    if (typeof _indexes[sheetName] === 'undefined') return false;
    var data_copy = JSON.parse(JSON.stringify(_indexes[sheetName]));

    data.forEach(function (row, key) {
      var index = _indexes[sheetName].indexOf(row[_meta.descriptions[sheetName].index]);
      if (index === -1) {
        _data[sheetName].push(row);
        _log('add ' + sheetName, row[_meta.descriptions[sheetName].displayName]);
        if (typeof cb === 'function') cb('add', row);
      } else {
        delete data_copy[index];
      }
    });
    data_copy.forEach(function (rowToDelete, key) {
      var row = _data[sheetName][key];
      _log('delete ' + sheetName, row[_meta.descriptions[sheetName].displayName]);
      delete _data[sheetName][key];
      if (typeof cb === 'function') cb('remove', row);
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

    var tmp_sheet = _spreadsheet.insertSheet(name).appendRow(_meta.definitions[_meta.descriptions[name].definition])
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
      Logger.log('ERROR in `SheetCrud._setRow()`: Sheet %s has %s columns while new row has %s columns',
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
      Logger.log('ERROR in `SheetCrud._sheetToJson()`: row need to has %s fields but it only has %s',
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
    //TODO: create independent log module
    //for (var i = 0; i < arguments.length; i++) {
    //  Logger.log('%s: %s', i.toString(), arguments[i]);
    //}
  }

  return SheetCrudClass;
})();
