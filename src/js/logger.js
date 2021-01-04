/* global WIDGET_COMMON_CONFIG */

var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.LoggerUtils = (function() {
  "use strict";

   var displayId = "",
     companyId = "",
     version = null;

  /*
   *  Private Methods
   */

  /* Retrieve parameters to pass to the event logger. */
  function getEventParams(params, cb) {
    var json = null;

    // event is required.
    if (params.event) {
      json = params;

      if (json.file_url) {
        json.file_format = params.file_format || getFileFormat(json.file_url);
      }

      json.company_id = companyId;
      json.display_id = displayId;

      var parent = getQueryParameter("parent"); // legacy presentations
      var type = getQueryParameter("type"); // templates
      var env = getQueryParameter("env"); // endpoint
      var viewerId = getQueryParameter("viewerId");

      var presentation_type = type ? type : (parent ? getQueryStringParameter("type", parent) : "");
      var endpoint_type = env ? env : (parent ? getQueryStringParameter("env", parent) : "");
      var viewer_id = viewerId ? viewerId : (parent ? getQueryStringParameter("viewerId", parent) : "");
      var schedule_id = parent ? getQueryStringParameter("id", parent) : "";

      json.viewer_id = viewer_id;

      if (presentation_type ==="sharedschedule") {
        json.presentation_type = presentation_type;
        json.schedule_id = schedule_id;
        json.env = endpoint_type;
      }

      if (version) {
        json.version = version;
      }

      cb(json);
    }
    else {
      cb(json);
    }
  }

  /**
   * Get the current URI query param
   */
  function getQueryParameter(param) {
    return getQueryStringParameter(param, window.location.href);
  }

  /**
   * Get the query parameter from a query string
   */
  function getQueryStringParameter(param, url) {
    param = param.replace(/[[]]/g, "\\$&");
    var regex = new RegExp("[?&]" + param + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) { return null; }
    if (!results[2]) { return ""; }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  // Get suffix for BQ table name.
  function getSuffix() {
    var date = new Date(),
      year = date.getUTCFullYear(),
      month = date.getUTCMonth() + 1,
      day = date.getUTCDate();

    if (month < 10) {
      month = "0" + month;
    }

    if (day < 10) {
      day = "0" + day;
    }

    return "" + year + month + day;
  }

  /*
   *  Public Methods
   */
  function getFileFormat(url) {
    var hasParams = /[?#&]/,
      str;

    if (!url || typeof url !== "string") {
      return null;
    }

    str = url.substr(url.lastIndexOf(".") + 1);

    // don't include any params after the filename
    if (hasParams.test(str)) {
      str = str.substr(0 ,(str.indexOf("?") !== -1) ? str.indexOf("?") : str.length);

      str = str.substr(0, (str.indexOf("#") !== -1) ? str.indexOf("#") : str.length);

      str = str.substr(0, (str.indexOf("&") !== -1) ? str.indexOf("&") : str.length);
    }

    return str.toLowerCase();
  }

  function getInsertData(params) {
    var BASE_INSERT_SCHEMA = {
      "kind": "bigquery#tableDataInsertAllRequest",
      "skipInvalidRows": false,
      "ignoreUnknownValues": false,
      "templateSuffix": getSuffix(),
      "rows": [{
        "insertId": ""
      }]
    },
    data = JSON.parse(JSON.stringify(BASE_INSERT_SCHEMA));

    data.rows[0].insertId = Math.random().toString(36).substr(2).toUpperCase();
    data.rows[0].json = JSON.parse(JSON.stringify(params));
    data.rows[0].json.ts = new Date().toISOString();

    return data;
  }

  function logEvent(table, params, endpointLoggingFields) {
    getEventParams(params, function(json) {
      if (json !== null) {
        RiseVision.Common.Logger.log(table, json);
      }
    });

    logEndpointEvent(params, endpointLoggingFields);
  }

  function startEndpointHeartbeats(eventApp) {
    if (!hasViewerEndpointHeartbeats()) { return; }

    var interval = window.top.RiseVision.Viewer.Logger.heartbeatInterval();
    var heartbeatFn = window.top.RiseVision.Viewer.Logger.recordUptimeHeartbeat;
    var boundHeartbeatFn = heartbeatFn.bind(null, {
      eventApp: eventApp,
      eventAppVersion: version
    });

    boundHeartbeatFn();
    setInterval(boundHeartbeatFn, interval);
  }

  function logEndpointEvent(params, endpointLoggingFields) {
    if (!endpointLoggingFields || !hasViewerEndpointLogging()) { return; }

    if (!params.event_details || !endpointLoggingFields.severity || !endpointLoggingFields.eventApp) {
      return console.error ("invalid endpoint logging attempt");
    }

    window.top.RiseVision.Viewer.Logger.logTemplateEvent({
      severity: endpointLoggingFields.severity,
      eventApp: endpointLoggingFields.eventApp,
      eventAppVersion: version,
      eventDetails: params.event_details || null,
      eventErrorCode: endpointLoggingFields.errorCode || null,
      debugInfo: params.error_details || endpointLoggingFields.debugInfo || null,
    });
  }

  function logEventToPlayer(table, params) {
    try {
      top.postToPlayer( {
        message: "widget-log",
        table: table,
        params: JSON.stringify(params),
        suffix: getSuffix()
      } );
    } catch (err) {
      console.log("widget-common.logEventToPlayer", err);
    }
  }

  /* Set the Company and Display IDs. */
  function setIds(company, display) {
    companyId = company;
    displayId = display;
  }

  function setVersion(value) {
    version = value;
  }

  function hasViewerEndpointLogging() {
    var hasIt = false;

    try {
      hasIt = window.top &&
      window.top.RiseVision &&
      window.top.RiseVision.Viewer &&
      window.top.RiseVision.Viewer.Logger &&
      window.top.RiseVision.Viewer.Logger.logTemplateEvent;
    } catch(err) {
      hasIt = false;
      if (console.debug) {console.debug(err);}
    }

    return hasIt;
  }

  function hasViewerEndpointHeartbeats() {
    var hasIt = false;

    try {
      hasIt = window.top &&
      window.top.RiseVision &&
      window.top.RiseVision.Viewer &&
      window.top.RiseVision.Viewer.Logger &&
      window.top.RiseVision.Viewer.Logger.recordUptimeHeartbeat;
    } catch(err) {
      hasIt = false;
      if (console.debug) {console.debug(err);}
    }

    return hasIt;
  }

  return {
    "getInsertData": getInsertData,
    "getFileFormat": getFileFormat,
    "getQueryParameter": getQueryParameter,
    "getQueryStringParameter": getQueryStringParameter,
    "logEvent": logEvent,
    "logEventToPlayer": logEventToPlayer,
    "startEndpointHeartbeats": startEndpointHeartbeats,
    "logEndpointEvent": logEndpointEvent,
    "setIds": setIds,
    "setVersion": setVersion
  };
})();

RiseVision.Common.Logger = (function(utils) {
  "use strict";

  var REFRESH_URL = "https://www.googleapis.com/oauth2/v3/token?client_id=" + WIDGET_COMMON_CONFIG.LOGGER_CLIENT_ID +
      "&client_secret=" + WIDGET_COMMON_CONFIG.LOGGER_CLIENT_SECRET +
      "&refresh_token=" + WIDGET_COMMON_CONFIG.LOGGER_REFRESH_TOKEN +
      "&grant_type=refresh_token";

  var serviceUrl = "https://www.googleapis.com/bigquery/v2/projects/client-side-events/datasets/Widget_Events/tables/TABLE_ID/insertAll",
    throttle = false,
    throttleDelay = 1000,
    lastEvent = "",
    refreshDate = 0,
    token = "";

  /*
   *  Private Methods
   */
  function refreshToken(cb) {
    var xhr = new XMLHttpRequest();

    if (new Date() - refreshDate < 3580000) {
      return cb({});
    }

    xhr.open("POST", REFRESH_URL, true);
    xhr.onloadend = function() {
      var resp = {};
      try {
        resp = JSON.parse(xhr.response);
      } catch(e) {
        console.warn("Can't refresh logger token - ", e.message);
      }
      cb({ token: resp.access_token, refreshedAt: new Date() });
    };

    xhr.send();
  }

  function isThrottled(event) {
    return throttle && (lastEvent === event);
  }

  /*
   *  Public Methods
   */
  function log(tableName, params) {
    if (!tableName || !params || (params.hasOwnProperty("event") && !params.event) ||
      (params.hasOwnProperty("event") && isThrottled(params.event))) {
      return;
    }

    // don't log if display id is invalid or preview/local (do log in case of shared schedule)
    if ((!params.presentation_type || params.presentation_type !=="sharedschedule") && (!params.display_id || params.display_id === "preview" || params.display_id === "display_id" ||
      params.display_id === "displayId")) {
      return;
    }

    try {
      if ( top.postToPlayer && top.enableWidgetLogging ) {
        // send log data to player instead of BQ
        return utils.logEventToPlayer( tableName, params );
      }
    } catch ( e ) {
      console.log( "widget-common: logger", e );
    }

    throttle = true;
    lastEvent = params.event;

    setTimeout(function () {
      throttle = false;
    }, throttleDelay);

    function insertWithToken(refreshData) {
      var xhr = new XMLHttpRequest(),
        insertData, url;

      url = serviceUrl.replace("TABLE_ID", tableName);
      refreshDate = refreshData.refreshedAt || refreshDate;
      token = refreshData.token || token;
      insertData = utils.getInsertData(params);

      // Insert the data.
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", "Bearer " + token);

      if (params.cb && typeof params.cb === "function") {
        xhr.onloadend = function() {
          params.cb(xhr.response);
        };
      }

      xhr.send(JSON.stringify(insertData));
    }

    return refreshToken(insertWithToken);
  }

  return {
    "log": log
  };
})(RiseVision.Common.LoggerUtils);
