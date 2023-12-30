import xml2js from 'xml2js';

function safeJSON(data, fallback) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return fallback;
    }
  }

  async function parseXML(xmlString) {
    return new Promise((resolve) => {
        const parser = xml2js.Parser();
        parser.parseString(xmlString, (err, result) => {
            if (err) {
                resolve({});
            } else {
                resolve(result);
            }
        });
    }); 
}
  
  export { safeJSON, parseXML };