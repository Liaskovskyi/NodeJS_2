import xml2js from 'xml2js';

function safeJSON(data, fallback) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return fallback;
    }
  }

function parseXML(xmlString, callback) {
    const parser = xml2js.Parser();
    parser.parseString(xmlString, (err, result) => {
      if (err) {
        callback({}, null);
      } else {
        callback(null, result);
      }
    });
  }
  
  export { safeJSON, parseXML };