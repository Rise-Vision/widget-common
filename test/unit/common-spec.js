/* jshint expr:true */
"use strict";

describe("getting query parameters", function() {
  it("returns null if no query parameter found", function() {
    var utils = RiseVision.Common.Utilities,
      value;

    value = utils.getQueryParameter("param");

    expect(value).to.be.null;
  });

  it("returns query parameter value", function() {
    var utils = RiseVision.Common.Utilities,
      value;

    history.pushState({}, "", "?param=abc123");
    value = utils.getQueryParameter("param");

    expect(value).to.equal("abc123");
  });
});

describe("getting query parameters from query string", function() {
  it("returns null if no query parameter found", function() {
    var utils = RiseVision.Common.Utilities,
      value;

    value = utils.getQueryStringParameter("param", "?param2=abc123");

    expect(value).to.be.null;
  });

  it("returns query parameter value", function() {
    var utils = RiseVision.Common.Utilities,
      value;

    value = utils.getQueryParameter("param", "?param=abc123");

    expect(value).to.equal("abc123");
  });
});

describe("getting date object from player version string", function() {
  it("returns undefined if no player version", function() {
    var utils = RiseVision.Common.Utilities,
      value;

    value = utils.getDateObjectFromPlayerVersionString();

    expect(value).to.be.undefined;
  });

  it("returns date object for a player version", function() {
    var utils = RiseVision.Common.Utilities,
      value;

    value = utils.getDateObjectFromPlayerVersionString("2016.10.10.00.00");

    expect(value.getDate()).to.equal(10);
    expect(value.getMonth()).to.equal(9);
    expect(value.getFullYear()).to.equal(2016);
    expect(value.getHours()).to.equal(0);
    expect(value.getMinutes()).to.equal(0);
  });
});

describe("getting viewer params", function() {
  it("returns object providing values without using parent", function() {
    var utils = RiseVision.Common.Utilities;

    history.pushState({}, "", "?type=sharedschedule&env=extension&viewerId=abc123");

    expect(utils.getViewerParams()).to.deep.equal({
      viewer_env: "extension",
      viewer_id: "abc123",
      viewer_type: "sharedschedule"
    });
  });

  it("returns object providing values using parent", function() {
    var utils = RiseVision.Common.Utilities;

    history.pushState({}, "", "?parent=http%3A%2F%2Fpreview.risevision.com%2F%3Ftype%3Dsharedschedule%26env%3Dembed%26viewerId%3Ddef456");

    expect(utils.getViewerParams()).to.deep.equal({
      viewer_env: "embed",
      viewer_id: "def456",
      viewer_type: "sharedschedule"
    });
  });

  it("returns object with null values when params not found in parent", function() {
    var utils = RiseVision.Common.Utilities;

    history.pushState({}, "", "?parent=http%3A%2F%2Fpreview.risevision.com%2F%3Fparam=123");

    expect(utils.getViewerParams()).to.deep.equal({
      viewer_env: null,
      viewer_id: null,
      viewer_type: null
    });
  });

  it("returns object with empty values when params not found including no parent", function() {
    var utils = RiseVision.Common.Utilities;

    history.pushState({}, "", "?param=123");

    expect(utils.getViewerParams()).to.deep.equal({
      viewer_env: "",
      viewer_id: "",
      viewer_type: ""
    });
  });
});

describe("getRiseCacheErrorMessage", function () {
  it("returns error message for rise cache 404", function() {
    var utils = RiseVision.Common.Utilities,
      value,
      status = 404;

    value = utils.getRiseCacheErrorMessage(status);

    expect(value).to.equal("The file does not exist or cannot be accessed.");
  });

  it("returns error message for rise cache 507", function() {
    var utils = RiseVision.Common.Utilities,
      value,
      status = 507;

    value = utils.getRiseCacheErrorMessage(status);

    expect(value).to.equal("There is not enough disk space to save the file on Rise Cache.");
  });

  it("returns error message for rise cache default error", function() {
    var utils = RiseVision.Common.Utilities,
      value,
      status = 500;

    value = utils.getRiseCacheErrorMessage(status);

    expect(value).to.equal("There was a problem retrieving the file from Rise Cache.");
  });
});

describe("getFontCssStyle", function () {
  var utils, className, obj;

  before(function() {
    utils = RiseVision.Common.Utilities;
    className = "test";
    obj = {
      "fontStyle": {
        "font": {
          "family": "verdana,geneva,sans-serif",
          "type": "standard"
        },
        "size": "18px",
        "customSize": "",
        "align": "left",
        "bold": false,
        "italic": false,
        "underline": false,
        "forecolor": "black",
        "backcolor": "transparent"
      }
    };
  });

  it("should return the correctly formatted string", function() {
    var value = utils.getFontCssStyle(className, obj.fontStyle);

    expect(value).to.equal(".test {font-family: verdana,geneva,sans-serif; color: black; font-size: 18px; font-weight: normal; font-style: normal; text-decoration: none; background-color: transparent;}");

  });

  it("should decode and strip single quotes from family name", function () {
    var value;

    obj.fontStyle.font.family = "My%20Custom'%20Font";

    value = utils.getFontCssStyle(className, obj.fontStyle);

    expect(value).to.equal(".test {font-family: My Custom Font; color: black; font-size: 18px; font-weight: normal; font-style: normal; text-decoration: none; background-color: transparent;}");

    obj.fontStyle.font.family = "verdana,geneva,sans-serif";
  });

  it("should handle backwards compatible 'color' value", function () {
    var value;

    obj.fontStyle.color = "#ffcc00";

    value = utils.getFontCssStyle(className, obj.fontStyle);

    expect(value).to.equal(".test {font-family: verdana,geneva,sans-serif; color: #ffcc00; font-size: 18px; font-weight: normal; font-style: normal; text-decoration: none; background-color: transparent;}");

    delete obj.fontStyle.color;
  });

  it("should handle backwards compatible size value missing 'px'", function () {
    var value;

    obj.fontStyle.size = "16";

    value = utils.getFontCssStyle(className, obj.fontStyle);

    expect(value).to.equal(".test {font-family: verdana,geneva,sans-serif; color: black; font-size: 16px; font-weight: normal; font-style: normal; text-decoration: none; background-color: transparent;}");

    obj.fontStyle.size = "18px";
  });

  it("should apply correct weight value if 'bold' is selected", function () {
    var value;

    obj.fontStyle.bold = true;

    value = utils.getFontCssStyle(className, obj.fontStyle);

    expect(value).to.equal(".test {font-family: verdana,geneva,sans-serif; color: black; font-size: 18px; font-weight: bold; font-style: normal; text-decoration: none; background-color: transparent;}");

    obj.fontStyle.bold = false;
  });

  it("should apply correct style value if 'italic' is selected", function () {
    var value;

    obj.fontStyle.italic = true;

    value = utils.getFontCssStyle(className, obj.fontStyle);

    expect(value).to.equal(".test {font-family: verdana,geneva,sans-serif; color: black; font-size: 18px; font-weight: normal; font-style: italic; text-decoration: none; background-color: transparent;}");

    obj.fontStyle.italic = false;
  });

  it("should apply correct style value if 'underline' is selected", function () {
    var value;

    obj.fontStyle.underline = true;

    value = utils.getFontCssStyle(className, obj.fontStyle);

    expect(value).to.equal(".test {font-family: verdana,geneva,sans-serif; color: black; font-size: 18px; font-weight: normal; font-style: normal; text-decoration: underline; background-color: transparent;}");

    obj.fontStyle.underline = false;
  });

  it("should handle backwards compatible 'highlightColor' value", function () {
    var value;

    obj.fontStyle.highlightColor = "#ffcc00";

    value = utils.getFontCssStyle(className, obj.fontStyle);

    expect(value).to.equal(".test {font-family: verdana,geneva,sans-serif; color: black; font-size: 18px; font-weight: normal; font-style: normal; text-decoration: none; background-color: #ffcc00;}");

    delete obj.fontStyle.highlightColor;
  });
});

describe("hasInternetConnection", function () {
  var utils = RiseVision.Common.Utilities;

  it("should return true if Internet connection exists", function () {
    var xhr = sinon.useFakeXMLHttpRequest(),
      requests = [],
      spy;

    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };

    spy = sinon.spy();

    // call the "hasInternetConnection" method
    utils.hasInternetConnection("http://test.com/img.png", spy);

    // check the request was added to the array
    expect(requests.length).to.equal(1);

    // force a successful server response
    requests[0].respond(200);

    expect(spy.calledWith(true));
  });

  it("should return false if Internet connection doesn't exist", function () {
    var xhr = sinon.useFakeXMLHttpRequest(),
      requests = [],
      spy;

    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };

    spy = sinon.spy();

    // call the "hasInternetConnection" method
    utils.hasInternetConnection("http://test.com/img.png", spy);

    // check the request was added to the array
    expect(requests.length).to.equal(1);

    // force a bad server response
    requests[0].respond(404);

    expect(spy.calledWith(false));
  });
});

describe("isLegacy", function () {
  var utils = RiseVision.Common.Utilities;

  it("should return true if browser version is less than legacy version", function () {

    window.navigator = {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/24.0.2564.116 Safari/537.36"
    };

    expect(utils.isLegacy()).to.be.true;

  });

  it("should return true if browser version is equal legacy version", function () {

    window.navigator = {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/25.0.2564.116 Safari/537.36"
    };

    expect(utils.isLegacy()).to.be.true;

  });

  it("should return false if browser version is greater than legacy version", function () {
    window.navigator = {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/26.0.2564.116 Safari/537.36"
    };

    expect(utils.isLegacy()).to.be.false;

  });
});

describe("addProtocol", function () {
  var utils = RiseVision.Common.Utilities;

  it("should return url with http:// when missing protocol", function () {

    expect(utils.addProtocol("www.test.com")).to.equal("http://www.test.com");

  });

  it("should not modify url when url already contains http:// protocol", function () {

    expect(utils.addProtocol("http://www.test.com")).to.equal("http://www.test.com");

  });

  it("should return url with https:// secure protocol when missing protocol and requiring secure", function () {

    expect(utils.addProtocol("www.test.com", true)).to.equal("https://www.test.com");

  });

  it("should not modify url when url contains https:// secure protocol", function () {

    expect(utils.addProtocol("https://www.test.com")).to.equal("https://www.test.com");

  });

  it("should not modify url when url contains ftp:// protocol", function () {

    expect(utils.addProtocol("ftp://www.test.com")).to.equal("ftp://www.test.com");

  });

  it("should not modify url when url contains ftps:// secure protocol", function () {

    expect(utils.addProtocol("ftps://www.test.com")).to.equal("ftps://www.test.com");

  });

});

