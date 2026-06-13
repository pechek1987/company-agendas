const https = require("https");
const crypto = require("crypto");

function getAuth(method, resourceType, resourceId, date, key) {
  const text = method.toLowerCase() + "\n" + resourceType.toLowerCase() + "\n" + resourceId + "\n" + date.toLowerCase() + "\n\n";
  const sig = crypto.createHmac("sha256", Buffer.from(key, "base64")).update(text).digest("base64");
  return encodeURIComponent("type=master&ver=1.0&sig=" + sig);
}

function cosmosQuery(endpoint, key, dbId, collId, query, parameters) {
  return new Promise(function(resolve, reject) {
    const host = endpoint.replace("https://", "").replace(/\/$/, "");
    const date = new Date().toUTCString();
    const resourceId = "dbs/" + dbId + "/colls/" + collId;
    const auth = getAuth("POST", "docs", resourceId, date, key);
    const body = JSON.stringify({ query: query, parameters: parameters });
    const options = {
      hostname: host,
      path: "/" + resourceId + "/docs",
      method: "POST",
      headers: {
        "Authorization": auth,
        "x-ms-date": date,
        "x-ms-version": "2018-12-31",
        "Content-Type": "application/query+json",
        "x-ms-documentdb-isquery": "True",
        "x-ms-documentdb-query-enablecrosspartition": "True",
        "Content-Length": Buffer.byteLength(body)
      }
    };
    const req = https.request(options, function(res) {
      var data = "";
      res.on("data", function(c) { data += c; });
      res.on("end", function() {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ Documents: [], error: data }); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function(context, req) {
  context.res = {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  };
  try {
    var endpoint = process.env.COSMOS_ENDPOINT;
    var key = process.env.COSMOS_KEY;
    var agendaKey = context.bindingData.agendaKey;
    var result = await cosmosQuery(endpoint, key, "agendas", "history",
      "SELECT * FROM c WHERE c.agendaKey = @key ORDER BY c.date DESC",
      [{ name: "@key", value: agendaKey }]
    );
    context.res.body = JSON.stringify(result.Documents || []);
  } catch(err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
