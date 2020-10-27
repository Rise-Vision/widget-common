var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.RiseGoogleSheet = function (params, riseData, callback) {

  "use strict";

  var API_BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets/",
    DATAKEY_BASE_NAME = "risesheet";

  var _riseDataInitialized = false,
    _requestPending = false,
    _refreshPending = false,
    _initialGo = true,
    _timer = null;

  /*
   *  Private Methods
   */

  function _getQueryParams() {
    var queryParams = {};

    // required to obtain public data
    queryParams.key = params.apikey;

    queryParams.majorDimension = params.dimension;

    queryParams.valueRenderOption = params.render;

    return queryParams;
  }

  function _getRange() {
    return ( params.range === "" ) ? "" : "!" + params.range;
  }

  function _getUrl() {
    return API_BASE_URL + params.key + "/values/" + encodeURIComponent( params.sheet ) + _getRange();
  }

  function _getTotalCols( results ) {
    var totalCols = 0;

    // Iterate over all rows to find the one with the most columns.
    results.forEach( function( element ) {
      if ( element.length > totalCols ) {
        totalCols = element.length;
      }
    } );

    return totalCols;
  }

  function _addMissingData( results ) {
    var count = 0,
      totalCols = _getTotalCols( results ),
      i;

    // Append cells to rows that have an incorrect number of columns.
    results.forEach( function( element ) {
      if ( element.length < totalCols ) {
        count = totalCols - element.length;

        for ( i = 0; i < count; i++ ) {
          element.push( "" );
        }
      }
    } );
  }

  function _prepareResponse( data ) {
    var response = {};
    /*
     Provide an empty array if values property missing in response object. This can occur if any range
     values (minColumn, maxColumn, minRow, maxRow) are out of scope of the data entered in worksheet
     */

    response.results = ( data.values ) ? data.values : [];

    // Workaround for this issue - https://goo.gl/rsazDP.
    _addMissingData( response.results );

    return response;
  }

  function _startTimer() {
    var refreshVal = parseInt( params.refresh, 10 );

    if ( !isNaN( refreshVal ) && refreshVal !== 0 ) {
      _clearTimer();

      _timer = setTimeout( function () {
        _refreshPending = true;
        go();
      }, refreshVal * 60000 );
    }
  }

  function _handleSheetError( xhr ) {
    var detail = {
      status: xhr.status,
      statusText: xhr.statusText
    };

    riseData.getItem( _getDataKey(), function( cachedData ) {
      detail = ( cachedData ) ? Object.assign( detail, cachedData.data ) : detail;

      callback( "error", detail );
    } );

    _requestPending = false;
    _startTimer();
  }

  function _handleSheetResponse( data ) {
    var responseData,
      cacheObj = {};

    if ( data ) {
      responseData = _prepareResponse( data );

      cacheObj.data = responseData;
      cacheObj.timestamp = Date.now();

      riseData.saveItem( _getDataKey(), cacheObj );

      callback( "response", responseData );
    }

    _requestPending = false;
    _startTimer();
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  function _makeRequest( maxDelayInSeconds ) {
    var url = _getUrl(),
      params = _getQueryParams(),
      randomizedDelay = getRandomInt( 0, maxDelayInSeconds ) * 1000;

    // set flag to prevent further requests in case go() function is called before prior request responds
    _requestPending = true;

    // Delay executing a request by randomized value within 'maxDelayInSeconds' range.
    // https://github.com/Rise-Vision/widget-google-spreadsheet/issues/321

    setTimeout( function() {
      $.getJSON(url, params)
        .done(function( json ) {
          _handleSheetResponse( json );
        })
        .fail(function( xhr ) {
          _handleSheetError( xhr );
        });
    }, randomizedDelay );
  }

  function _getDataKey() {
    return DATAKEY_BASE_NAME + "_" + params.key + "_" + encodeURIComponent( params.sheet.replace( /\s+/g, "_" ) ) +
      ( params.range === "" ? "" : "_" + params.range );
  }

  function _clearTimer() {
    clearTimeout(_timer);
    _timer = null;
  }

  function _process( cachedData ) {
    var refreshVal = parseInt( params.refresh, 10 ),
      then,
      date,
      now,
      diff;

    if ( _refreshPending || !cachedData ) {
      // refresh timer completed or there is no cached data available, make the request
      _refreshPending = false;
      _makeRequest( !cachedData ? 60 : 180 );
    } else {
      // provide cached data immediately for the response
      callback( "response", cachedData.data );

      if ( _initialGo ) {
        _initialGo = false;

        // first time component is executing go()

        if ( !isNaN( refreshVal ) && refreshVal !== 0 ) {
          then = cachedData.timestamp;
          // maintain backwards compatiblity for previous timestamp in MomentJS format (ISO 8601)
          if ( isNaN( then ) ) {
            date = new Date(cachedData.timestamp);
            then = date.getTime();
          }

          now = Date.now();

          diff = Math.ceil((now - then) / 1000 / 60 );

          // compare refresh value to amount of time that has passed since last timestamp in cached data

          if ( diff >= refreshVal ) {
            // more time has gone by than the assigned refresh value, make the request
            _makeRequest( 180 );
          } else {
            // start a refresh timer with the remaining refresh time left as the interval
            _clearTimer();

            _timer = setTimeout( function () {
              _makeRequest( 180 );
            }, ( refreshVal - diff ) * 60000 );
          }
        }
      }
    }
  }

  function _onRiseDataInitialized() {
    _riseDataInitialized = true;

    riseData.getItem( _getDataKey(), function( cachedData ) {
      _process( cachedData );
    } );
  }

  /*
   *  Public Methods
   */
  function go() {
    // key, apikey, and sheet are required, don't make request if any are missing or if a previous request is pending
    if ( !params.key || !params.apikey || params.sheet === "" || _requestPending ) {
      return;
    }

    if ( !_riseDataInitialized ) {
      return riseData.init(_onRiseDataInitialized);
    }

    riseData.getItem( _getDataKey(), function( cachedData ) {
      _process( cachedData );
    } );
  }

  return {
    go: go
  };
};
