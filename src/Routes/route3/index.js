function GET(req, res, url, payload) {
    throw "error";
    res.json({ message: '/route3 GET request' });
  }
  
  function POST(req, res, url, payload) {
    throw "error";
    res.json(payload);
  }
  
  export { GET, POST };