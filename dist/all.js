var RiseVision = RiseVision || {};

// check if dependencies exist
if (typeof gapi === 'undefined') {
  throw new Error("authorization.js dependencies not loaded");
} else {
  // dependencies exist, create module
  RiseVision.Authorization = (function(gapi) {
    "use strict";

    // Constants
    var CLIENT_ID = "614513768474.apps.googleusercontent.com";

    // Private vars
    var oauthToken = null, loaded = false;

    function authorize(immediate, scope, callbackFn){
      gapi.auth.authorize({
        client_id : CLIENT_ID,
        scope : scope,
        immediate : immediate
      }, function(authResult){
        if (authResult && !authResult.error) {
          oauthToken = authResult.access_token;
        } else {
          if(window.console){
            console.info("Authorization Fail: " + authResult.error);
          }
        }
        callbackFn.call(null,oauthToken);
      });
    }

    function isApiLoaded(){
      return loaded;
    }

    function loadApi(callbackFn){
      // Use the API Loader script to load the Authentication script.
      gapi.load('auth', {'callback': function(){
        loaded = true;
        if(typeof callbackFn === 'function'){
          callbackFn.apply(null);
        }
      }});
    }

    function getAuthToken(){
      return oauthToken;
    }

    return {
      authorize: authorize,
      getAuthToken: getAuthToken,
      isApiLoaded: isApiLoaded,
      loadApi: loadApi
    };
  })(gapi);
}

var RiseVision = RiseVision || {};

RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.Validation = (function() {
	"use strict";

	/*
	Defining the regular expressions being used
	 */
	var urlRegExp = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i,
      numericRegex = /^(\-|\+)?([0-9]+|Infinity)$/,
			decimalRegex = /^\-?[0-9]*\.?[0-9]+$/;

	function greaterThan(element, param) {
		var value = element.value.trim();

		if (!decimalRegex.test(value)) {
			return false;
		}

		return (parseFloat(value) > parseFloat(param));
	}

	function lessThan(element, param) {
		var value = element.value.trim();

		if (!decimalRegex.test(value)) {
			return false;
		}

		return (parseFloat(value) < parseFloat(param));
	}

	function numeric(element){
		var value = element.value.trim();

		/*
		 Regexp being used is stricter than parseInt. Using regular expression as
		 mentioned on mozilla
		 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
		 Global_Objects/parseInt
		 */
		return numericRegex.test(value);
	}

	function required(element){
		var value = element.value.trim(),
				valid = false;

		if (element.type === "checkbox" || element.type === "radio") {
			if(element.checked === true) {
				valid = true;
			}
		} else {
			if (value !== null && value !== '') {
				valid = true;
			}
		}

		return valid;
	}

	function url(element){
		var value = element.value.trim();

    // Add http:// if no protocol parameter exists
    if (value.indexOf("://") === -1) {
      value = "http://" + value;
    }
		/*
		 Discussion
		 http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-
		 with-links#21925491

		 Using
     https://gist.github.com/dperini/729294
     Reasoning
     http://mathiasbynens.be/demo/url-regex

		 */
		return urlRegExp.test(value);
	}

	return {
		isGreaterThan: greaterThan,
		isLessThan: lessThan,
		isValidRequired: required,
		isValidURL: url,
		isValidNumber: numeric
	};
})();

RiseVision.Common.Utilities = (function() {

  function getFontCssStyle(className, fontObj) {
    var family = "font-family:" + fontObj.font.family + "; ";
    var color = "color: " + fontObj.color + "; ";
    var size = "font-size: " + fontObj.size + "px; ";
    var weight = "font-weight: " + (fontObj.bold ? "bold" : "normal") + "; ";
    var italic = "font-style: " + (fontObj.italic ? "italic" : "normal") + "; ";
    var underline = "text-decoration: " + (fontObj.underline ? "underline" : "none") + "; ";

    return "." + className + " {" + family + color + size + weight + italic + underline + "}";
  }

  function addCSSRules(rules) {
    var style = document.createElement("style");

    for (var i = 0, length = rules.length; i < length; i++) {
      style.appendChild(document.createTextNode(rules[i]));
    }

    document.head.appendChild(style);
  }

	function loadCustomFont(family, url, contentDocument) {
		var sheet = null;
		var rule = "font-family: " + family + "; " + "src: url('" + url + "');";

    contentDocument = contentDocument || document;

		sheet = contentDocument.styleSheets[0];

		if (sheet !== null) {
			sheet.addRule("@font-face", rule);
		}
	}

	function loadGoogleFont(family, contentDocument) {
    var stylesheet = document.createElement("link");

		contentDocument = contentDocument || document;

		stylesheet.setAttribute("rel", "stylesheet");
		stylesheet.setAttribute("type", "text/css");
		stylesheet.setAttribute("href", "https://fonts.googleapis.com/css?family=" +
			family);

		if (stylesheet !== null) {
			contentDocument.getElementsByTagName("head")[0].appendChild(stylesheet);
		}
	}

  return {
    getFontCssStyle:  getFontCssStyle,
    addCSSRules:      addCSSRules,
    loadCustomFont:   loadCustomFont,
    loadGoogleFont:   loadGoogleFont
  };
})();
var WIDGET_COMMON_CONFIG = {
  STORE_URL: "https://store-dot-rvaserver2.appspot.com/",
  AUTH_PATH_URL: "v1/widget/auth",
};

var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.Financial = {};
RiseVision.Common.Financial.Helper = {};
RiseVision.Common.Financial.RealTime = {};
RiseVision.Common.Financial.Historical = {};
RiseVision.Common.Financial.Historical.CollectionTimes = {};

RiseVision.Common.Financial.Helper = function(instruments) {
  this.instruments = instruments;
};

RiseVision.Common.Financial.Helper.prototype.setInstruments = function(instruments) {
  this.instruments = instruments;
};

RiseVision.Common.Financial.Helper.prototype.getInstruments = function(isLoading, collectionTimes) {
  var self = this;

  if (isLoading) {
    return this.instruments.join("|");
  }
  else {
    var dayOfWeek = new Date().getDay(), len = collectionTimes.length, instruments = [];

    $.each(this.instruments, function(i, instrument) {
      for (var j = 0; j < len; j++) {
        if (instrument === collectionTimes[j].instrument) {
          var startTime = collectionTimes[j].startTime, endTime = collectionTimes[j].endTime, daysOfWeek = collectionTimes[j].daysOfWeek;

          //Check if the instrument should be requested again based on its collection data.
          $.each(daysOfWeek, function(j, day) {
            //Check collection day.
            if (day === dayOfWeek) {
              //Check collection time.
              if (new Date().between(startTime, endTime)) {
                instruments.push(self.instruments[i]);
              }

              return false;
            }
          });
        }
      }
    });

    return instruments.join("|");
  }
};

RiseVision.Common.Financial.RealTime = function(displayID, instruments) {
  var self = this;

  if (displayID) {
    this.displayID = displayID;
  }
  else {
    this.displayID = "preview";
  }

  this.instruments = instruments;
  this.isLoading = true;
  this.conditions = {};
  this.collectionTimes = [];
  this.updateInterval = 60000;
  this.now = Date.today();
  //Issue 922
  this.url = "http://contentfinancial2.appspot.com/data?";
  this.logosURL = "https://s3.amazonaws.com/risecontentlogos/financial/";
  this.viz = new RiseVision.Common.Visualization();
  this.helper = new RiseVision.Common.Financial.Helper(this.instruments);
};

RiseVision.Common.Financial.RealTime.prototype.setInstruments = function(instruments) {
  //Trim any whitespace from instruments.
  instruments = instruments.split(",");

  $.each(instruments, function(index, value) {
    instruments[index] = $.trim(instruments[index]);
  });

  this.isLoading = true;
  this.collectionTimes = [];
  this.instruments = instruments;
  this.helper.setInstruments(this.instruments);
};

/* fields is an array of fields to request from data server. Note: instrument column is always requested. */
/* Financial Data */
RiseVision.Common.Financial.RealTime.prototype.getData = function(fields, loadLogos, isChain, callback) {
  var self = this, duplicateFound = false, fieldCount = 0, queryString = "select instrument", codes = "";

  this.dataFields = {};
  this.dataFields.instrument = 0;
  //TODO: Get rid of startTimeIndex and append instruments as last column?
  this.startTimeIndex = 1;
  //Used to determine where collection data columns are.

  if (this.isLoading) {
    this.callback = callback;
  }

  //Build the query string.
  $.each(fields, function(index, field) {
    duplicateFound = false;

    //Do nothing as instrument is already being requested.
    if (field === "instrument") {
    }
    else {
      //Visualization API doesn't allow requesting the same field more than once.
      $.each(self.dataFields, function(i, dataField) {
        if (i === field) {
          duplicateFound = true;
          return false;
        }
      });

      if (!duplicateFound) {
        queryString += ", " + field;
        //Create a mapping between field names and column indices.
        self.dataFields[field] = fieldCount + 1;
        fieldCount++;
        self.startTimeIndex++;
      }
    }
  });

  this.logoCount = 0;
  queryString += ", startTime, endTime, daysOfWeek, timeZoneOffset";

  //Issue 922 Start
  if (!Date.equals(Date.today(), this.now)) {
    this.now = Date.today();

    for (var i = 0; i < this.collectionTimes.length; i++) {
      this.collectionTimes[i].startTime.addDays(1);
      this.collectionTimes[i].endTime.addDays(1);
    }
  }
  //Issue 922 End

  codes = this.helper.getInstruments(this.isLoading, this.collectionTimes);

  //Perform a search for the instruments.
  if (codes) {
    var options = {
      url : this.url + "id=" + this.displayID + "&codes=" + codes,
      refreshInterval : 0,
      queryString : queryString,
      callback : function rtCallback(data) {
        self.onRealTimeDataLoaded(data, loadLogos, isChain);
      }
    };

    //Start a timer in case there is a problem loading the data (i.e. Internet has been disconnected).
    this.getDataTimer = setTimeout(function() {
      self.getData(fields, loadLogos, isChain, callback);
    }, this.updateInterval);

    this.viz.getData(options);
  }
  else {
    callback(null);
  }
};

RiseVision.Common.Financial.RealTime.prototype.onRealTimeDataLoaded = function(data, loadLogos, isChain) {
  if (data !== null) {
    clearTimeout(this.getDataTimer);

    this.data = data;

    if (this.isLoading) {
      this.isLoading = false;

      if (this.collectionTimes.length === 0) {
        this.saveCollectionTimes();
      }

      if (loadLogos) {
        this.loadLogos();
      }
      else {
        if (this.callback) {
          this.callback(this.data, this.logoURLs);
        }
      }
    }
    else {
      if (loadLogos && isChain) {
        this.loadLogos();
      }
      else {
        if (this.callback) {
          this.callback(this.data, this.logoURLs);
        }
      }
    }
  }
  //Timeout or some other error occurred.
  else {
    console.log("Error encountered loading real-time data for: ");
    console.log(this.instruments[0]);
  }
};

RiseVision.Common.Financial.RealTime.prototype.saveCollectionTimes = function() {
  var numRows, timeZoneOffset, startTime, endTime;

  numRows = this.data.getNumberOfRows();

  //Only need to save collection time once for the entire chain.
  //Use the collection data from the first stock since the rest should all be the same.
  //Data is for a chain if there is only one instrument being requested, but multiple rows of data are returned.
  if ((this.instruments.length === 1) && (this.data.getNumberOfRows() > 1)) {
    if ((this.data.getValue(0, 0) !== "INVALID_SYMBOL")) {
      // If the data is stale, then force collection times to be saved again later.
      if (this.data.getValue(0, 0) === "...") {
        this.isLoading = true;
      }
      else {
        timeZoneOffset = this.data.getValue(0, this.startTimeIndex + 3);
        startTime = this.data.getValue(0, this.startTimeIndex);
        endTime = this.data.getValue(0, this.startTimeIndex + 1);

        if (startTime && endTime && timeZoneOffset !== "N/P") {
          this.collectionTimes.push({
            "instrument" : this.instruments[0],
            "startTime" : startTime.setTimezoneOffset(timeZoneOffset),
            "endTime" : endTime.setTimezoneOffset(timeZoneOffset),
            "daysOfWeek" : this.data.getFormattedValue(0, this.startTimeIndex + 2).split(",")
          });
        }
      }
    }
  }
  //Save collection data for each stock.
  else {
    for (var row = 0; row < numRows; row++) {
      if (this.data.getValue(row, 0) !== "INVALID_SYMBOL") {
        // If the data is stale, then force collection times to be saved again later.
        if (this.data.getValue(row, 0) === "...") {
          this.isLoading = true;
        }
        else {
          timeZoneOffset = this.data.getValue(row, this.startTimeIndex + 3);
          startTime = this.data.getValue(row, this.startTimeIndex);
          endTime = this.data.getValue(row, this.startTimeIndex + 1);

          if (startTime && endTime && timeZoneOffset !== "N/P") {
            this.collectionTimes.push({
              "instrument" : this.instruments[row],
              "startTime" : startTime.setTimezoneOffset(timeZoneOffset),
              "endTime" : endTime.setTimezoneOffset(timeZoneOffset),
              "daysOfWeek" : this.data.getFormattedValue(row, this.startTimeIndex + 2).split(",")
            });
          }
        }
      }
    }

    if (this.collectionTimes.length === 0) {
      console.log(this.collectionTimes);
    }
  }
};

//Preload the logos.
RiseVision.Common.Financial.RealTime.prototype.loadLogos = function() {
  var numRows = this.data.getNumberOfRows();

  this.logoCount = 0;
  this.urls = [];
  this.logoURLs = [];

  for (var row = 0; row < numRows; row++) {
    this.urls.push(this.logosURL + this.data.getFormattedValue(row, 0) + ".svg");
  }

  this.loadLogo(this.urls.length);
};

//Load each logo.
RiseVision.Common.Financial.RealTime.prototype.loadLogo = function(toLoad) {
  var logo, self = this;

  logo = new Image();
  logo.onload = function() {
    self.logoURLs.push(logo.src);
    self.onLogoLoaded(toLoad);
  };

  logo.onerror = function() {
    self.logoURLs.push(null);
    self.onLogoLoaded(toLoad);
  };

  logo.src = this.urls[this.logoCount];
};

RiseVision.Common.Financial.RealTime.prototype.onLogoLoaded = function(toLoad) {
  this.logoCount++;
  toLoad--;

  if (toLoad === 0) {
    if (this.callback) {
      this.callback(this.data, this.logoURLs);
    }
  }
  else {
    this.loadLogo(toLoad);
  }
};

/* Conditions */
RiseVision.Common.Financial.RealTime.prototype.checkSigns = function(field) {
  var row = 0, signs = [], current, sign;

  for ( row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
    current = this.data.getValue(row, this.dataFields[field]);

    if (isNaN(current)) {
      current = current.replace(/[^0-9\.-]+/g, "");
      current = parseFloat(current);
    }

    if (!isNaN(current)) {
      if (current >= 0) {
        sign = 1;
      }
      else {
        sign = -1;
      }

      signs.push(sign);
    }
  }

  return signs;
};

/* Return 1 if current value is greater than the previous value.
 Return 0 if both values are equal.
 Return -1 if current value is less than the previous value. */
RiseVision.Common.Financial.RealTime.prototype.compare = function(field) {
  var self = this, current = 0, previous = 0, result = [], matchFound = false;

  if (this.conditions[field]) {
    for ( row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
      current = this.data.getValue(row, this.dataFields[field]);
      matchFound = false;

      $.each(this.conditions[field], function(index, value) {
        //Instrument is used to ensure that the rows that are being compared are for the same stock.
        //In chains, rows may be added or deleted.
        if (value.instrument === self.data.getValue(row, 0)) {
          previous = value.value;

          if (isNaN(current)) {
            current = current.replace(/[^0-9\.-]+/g, "");
            current = parseFloat(current);
          }

          if (isNaN(previous)) {
            previous = previous.replace(/[^0-9\.-]+/g, "");
            previous = parseFloat(previous);
          }

          //The data type of a column can still be a number even if there is string data in it.
          //To be sure, let's check that the values we are comparing are numbers.
          if (!isNaN(current) && !isNaN(previous)) {
            if (current != previous) {
              if (current > previous) {
                result.push(1);
              }
              else {
                result.push(-1);
              }
            }
            //They are equal.
            else {
              result.push(0);
            }
          }

          matchFound = true;

          return false;
        }
      });

      //No match found for this instrument (ie it's new).
      if (!matchFound) {
        result.push(0);
      }
    }
  }

  this.saveBeforeValues([field]);

  return result;
};

RiseVision.Common.Financial.RealTime.prototype.saveBeforeValues = function(fields) {
  var self = this;

  $.each(fields, function(index, value) {
    self.conditions[value] = [];
    self.saveBeforeValue(value, self.dataFields[value]);
  });
};

/* Store the current values so they can be compared to new values on a refresh. */
RiseVision.Common.Financial.RealTime.prototype.saveBeforeValue = function(field, colIndex) {
  for (var row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
    this.conditions[field].push({
      "instrument" : this.data.getValue(row, 0),
      "value" : this.data.getValue(row, colIndex)
    });
  }
};

RiseVision.Common.Financial.Historical = function(displayID, instrument, duration) {
  var self = this;

  if (displayID) {
    this.displayID = displayID;
  }
  else {
    this.displayID = "preview";
  }

  this.instrument = instrument;
  this.duration = duration;
  this.isLoading = true;
  this.updateInterval = 60000;
  this.now = Date.today();
  //Issue 922
  this.url = "http://contentfinancial2.appspot.com/data/historical?";
  this.historicalViz = new RiseVision.Common.Visualization();
  this.helper = new RiseVision.Common.Financial.Helper([this.instrument]);
};

RiseVision.Common.Financial.Historical.prototype.setInstrument = function(instrument) {
  this.isLoading = true;
  this.instrument = instrument;
  this.helper.setInstruments([this.instrument]);
};

RiseVision.Common.Financial.Historical.prototype.setDuration = function(duration) {
  this.duration = duration;
};

RiseVision.Common.Financial.Historical.prototype.setIsUpdated = function(isUpdated) {
  CollectionTimes.getInstance().setIsUpdated(this.instrument, isUpdated);
};
/* Historical Financial data - Only one stock can be requested at a time. */
RiseVision.Common.Financial.Historical.prototype.getHistoricalData = function(fields, callback, options) {
  var self = this, queryString = "select " + fields.join() + " ORDER BY tradeTime", codes = "";

  //Customize the query string.
  if (options) {
    if (options.sortOrder) {
      if (options.sortOrder === "desc") {
        queryString += " desc";
      }
    }

    if (options.limit) {
      queryString += " LIMIT " + options.limit;
    }
  }

  CollectionTimes.getInstance().addInstrument(this.instrument, this.now, function(times, now) {
    self.now = now;
    codes = self.helper.getInstruments(self.isLoading, [times]);

    //Perform a search for the instrument.
    if (codes) {
      options = {
        url : self.url + "id=" + self.displayID + "&code=" + self.instrument + "&kind=" + self.duration,
        refreshInterval : 0,
        queryString : queryString,
        callback : function histCallback(data) {
          self.onHistoricalDataLoaded(data, times, callback);
        }
      };

      //Start a timer in case there is a problem loading the data (i.e. Internet has been disconnected).
      self.getHistoricalDataTimer = setTimeout(function() {
        self.getHistoricalData(fields, callback, options);
      }, self.updateInterval);

      self.historicalViz.getData(options);
    }
    //Request has been made outside of collection times.
    else {
      callback(null);
    }
  });
};

RiseVision.Common.Financial.Historical.prototype.onHistoricalDataLoaded = function(data, times, callback) {
  var numDataRows = 0;

  if (data !== null) {
    clearTimeout(this.getHistoricalDataTimer);

    this.historicalData = data;
    numDataRows = data.getNumberOfRows();

    if ((numDataRows === 0) || ((numDataRows === 1) && (data.getFormattedValue(0, 0) === "0"))) {
      this.isLoading = true;
    }
    else {
      this.isLoading = false;
    }

    if (this.historicalData !== null) {
      callback({
        "data" : this.historicalData,
        "collectionData" : times
      });
    }
    else {
      callback({
        "collectionData" : times
      });
    }
  }
  //Timeout or some other error occurred.
  else {
    console.log("Error encountered loading historical data for: ");
    console.log(this);
  }
};

/*
 * Singleton object to handle retrieving collection times for a historical instrument.
 */
var CollectionTimes = (function() {
  //Private variables and functions.
  var instantiated = false, instruments = [];

  function init() {
    //Issue 903 Start
    function loadCollectionTimes(instrument, callback) {
      var updateInterval = 60000, viz = new RiseVision.Common.Visualization(), options;

      //Start a timer in case there is a problem loading the data (i.e. Internet has been disconnected).
      collectionTimesTimer = setTimeout(function() {
        loadCollectionTimes(instrument, callback);
      }, updateInterval);

      options = {
        //Change me for Production.
        url : "http://contentfinancial2.appspot.com/info?codes=" + instrument,
        refreshInterval : 0,
        queryString : "select startTime, endTime, daysOfWeek, timeZoneOffset, updateInterval",
        callback : function(result, timer) {
          viz = null;

          if (result !== null) {
            clearTimeout(timer);
            saveCollectionTimes(instrument, result);
            callback();
          }
          //Timeout or some other error occurred.
          else {
            console.log("Error encountered loading collection times for: " + instrument);
          }
        },
        params : collectionTimesTimer
      };

      viz.getData(options);
    }

    //Issue 903 End

    function saveCollectionTimes(instrument, data) {
      var numRows, startTime, endTime, timeZoneOffset;

      if (data !== null) {
        numRows = data.getNumberOfRows();

        for (var i = 0; i < instruments.length; i++) {
          if (instruments[i].instrument === instrument) {
            timeZoneOffset = data.getValue(0, 3);
            startTime = data.getValue(0, 0);
            endTime = data.getValue(0, 1);

            instruments[i].collectionTimes = {
              "instrument" : instrument,
              "startTime" : startTime.setTimezoneOffset(timeZoneOffset),
              "endTime" : endTime.setTimezoneOffset(timeZoneOffset),
              "daysOfWeek" : data.getFormattedValue(0, 2).split(","),
              "timeZoneOffset" : timeZoneOffset,
              "isUpdated" : true
            };

            break;
          }
        }
      }
    }

    return {
      setIsUpdated : function(instrument, isUpdated) {
        for (var i = 0; i < instruments.length; i++) {
          if (instruments[i].instrument === instrument) {
            if (instruments[i].collectionTimes !== null) {
              instruments[i].collectionTimes.isUpdated = isUpdated;
            }
          }
        }
      },
      addInstrument : function(instrument, now, callback) {
        var i = 0, instrumentFound = false, collectionTimesFound = false;

        //Check if there is already collection data for this instrument.
        for (; i < instruments.length; i++) {
          if (instruments[i].instrument === instrument) {
            //Issue 922 Start
            if (instruments[i].collectionTimes !== null) {
              if ((!Date.equals(Date.today(), now)) && (!instruments[i].collectionTimes.isUpdated)) {
                now = Date.today();
                instruments[i].collectionTimes.startTime.addDays(1);
                instruments[i].collectionTimes.endTime.addDays(1);
                instruments[i].collectionTimes.isUpdated = true;
              }

              collectionTimesFound = true;
            }
            //Issue 922 End

            instrumentFound = true;
            break;
          }
        }

        if (collectionTimesFound) {
          callback(instruments[i].collectionTimes, now);
        }
        else {
          if (!instrumentFound) {
            instruments.push({
              instrument : instrument,
              collectionTimes : null
            });
          }

          loadCollectionTimes(instrument, function() {
            callback(instruments[i].collectionTimes, now);
          });
        }
      }
    };
  }

  //Public functions.
  return {
    getInstance : function() {
      if (!instantiated) {
        instantiated = init();
      }

      return instantiated;
    }
  };
})();
// Implements http://www.risevision.com/help/developers/store-authorization/

var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.Store = RiseVision.Common.Store || {};
RiseVision.Common.Store.Auth = {};

RiseVision.Common.Store.Auth = function() {
  var HOUR_IN_MILLIS = 60 * 60 * 1000;
  var backDrop, warningDialog;
  this.callback = null;
  this.authorized = true;
  
  this.checkForDisplay = function(displayId, productCode, callback) {
    this.callback = callback;
    this.url = WIDGET_COMMON_CONFIG.STORE_URL +
              WIDGET_COMMON_CONFIG.AUTH_PATH_URL + 
              "?id=" + displayId + "&pc=" + productCode + "";
              
    this.callApi();
  };
 
  this.checkForCompany = function(companyId, productCode, callback) {
    this.callback = callback;
    this.url = WIDGET_COMMON_CONFIG.STORE_URL +
              WIDGET_COMMON_CONFIG.AUTH_PATH_URL + 
              "?cid=" + companyId + "&pc=" + productCode + "";
              
    this.callApi();
  };
  
  this.callApi = function() {
    var self = this;

    $.ajax({
      dataType: "json",
      url: this.url,
      success: function(data, textStatus) {
        self.onSuccess(data, textStatus);
      },
      error: function() {
        self.onError();
      }
    });
  };
  
  this.onSuccess = function(data, textStatus) {
    var self = this;
    if (data && data.authorized) {
      this.authorized = true;
      
      hideNotification();
      
      // check again for authorization one hour before it expires
      var milliSeconds = new Date(data.expiry).getTime() - new Date().getTime() - HOUR_IN_MILLIS;
      setTimeout(this.callApi, milliSeconds);
    }
    else if (data && !data.authorized) {
      this.authorized = false;
      
      showNotification("Product not authorized.");
      
      // check authoriztation every hour if failed
      setTimeout(this.callApi, HOUR_IN_MILLIS);
    }
    else {
      // API failed, try again in an hour
      setTimeout(this.callApi, HOUR_IN_MILLIS);
    }

    if (this.callback) {
      this.callback(this.authorized);
    }
  };
  
  this.onError = function() {
    this.authorized = false;
    
    showNotification("Cannot connect to Store for authorization.");
    
    // check authoriztation every hour if failed
    setTimeout(this.callApi, HOUR_IN_MILLIS);
    
    if (this.callback) {
      this.callback(this.authorized);
    }
  };
  
  function showNotification(message) {
    backDrop = document.createElement("div");
    backDrop.className = "overlay";
    document.body.appendChild(backDrop);

    warningDialog = document.createElement("div");
    warningDialog.className = "auth-warning";
    warningDialog.innerHTML = message;
    warningDialog = document.body.appendChild(warningDialog);
  } 
  
  function hideNotification() {
    if (backDrop && warningDialog) {
      warningDialog.parentNode.removeChild(warningDialog);
      backDrop.parentNode.removeChild(backDrop);    
    }
  }
};

var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.Visualization = {};

/*
 * Use the Google Visualization API to read data from a Google spreadsheet or other visualization data source.
 */
RiseVision.Common.Visualization = function() {
  this.query = null;
  this.isVisualizationLoaded = false;
};

RiseVision.Common.Visualization.prototype.getData = function(opts) {
  this.url = opts.url;
  this.refreshInterval = opts.refreshInterval || 0;
  this.timeout = opts.timeout || 30;
  this.callback = opts.callback;
  this.params = opts.params;
  //Issue 903

  if (opts.queryString) {
    this.queryString = opts.queryString;
  }

  //For some reason, trying to load the Visualization API more than once does not execute the callback function.
  if (!this.isVisualizationLoaded) {
    this.loadVisualizationAPI();
  }
  else {
    this.sendQuery();
  }
};

RiseVision.Common.Visualization.prototype.loadVisualizationAPI = function() {
  var self = this;

  google.load("visualization", "1", {
    "callback" : function() {
      self.isVisualizationLoaded = true;
      self.sendQuery();
    }
  });
};

RiseVision.Common.Visualization.prototype.sendQuery = function() {
  var self = this;

  if (this.query !== null) {
    this.query.abort();
  }

  this.query = new google.visualization.Query(this.url);
  this.query.setRefreshInterval(this.refreshInterval);

  //Sets the number of seconds to wait for the data source to respond before raising a timeout error.
  this.query.setTimeout(this.timeout);

  if (this.queryString) {
    this.query.setQuery(this.queryString);
  }

  this.query.send(function onQueryExecuted(response) {
    self.onQueryExecuted(response);
  });
};

RiseVision.Common.Visualization.prototype.onQueryExecuted = function(response) {
  if (response === null) {
    this.callback(response, this.params);
  }
  else {
    if (response.isError()) {
      console.log("Message: " + response.getMessage());
      console.log("Detailed message: " + response.getDetailedMessage());
      console.log("Reasons: " + response.getReasons());
      this.callback(null, this.params);
      this.query.abort();
    }
    else {
      this.callback(response.getDataTable(), this.params);
    }
  }
};
