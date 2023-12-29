function GET(req, res, url, payload) {
    res.json({ message: `/route1 GET request. Url host: ${url.host}` });
  }
  
  function POST(req, res, url, payload) {
    res.json(payload);
  }
  
  export { GET, POST };