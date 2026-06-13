const https = require("https");
const crypto = require("crypto");

function getAuthHeader(method, resourceType, resourceId, date, key) {
  const text = [
    method.toLowerCase(),
    resourceType.toLowerCase(),
    resourceId,
    date.toLowerCase(),
    "",
    ""
  ].join("\n");
  const sig = crypto.createHmac("sha256", Buffer.from(key, "base64")).update(text).digest("base64");
  return encodeURIComponent(`type=master&ver=1.0&sig=${sig}`);
}

function request(method, path, body, key, endpoint) {
  return new Promise((resolve, reject) => {
    const host = endpoint.replace("https://", "").replace(/\/$/, "");
    const date = new Date().toUTCString();
    const parts = path.split("/");
    const resourceType = parts[parts.length - (parts.length % 2 === 0 ? 2 : 1)];
    const resourceId = parts.length % 2 === 0 ? parts.slice(0, parts.length).join("/") : parts.slice(0, parts.length - 1).join("/");
    const auth = getAuthHeader(method, resourceType, resourceId, date, key);
    const bodyStr = body ? JSON.stringify(body) : "";
    const headers = {
      "Authorization": auth,
      "x-ms-date": date,
      "x-ms-version": "2018-12-31",
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Content-Length": Buffer.byteLength(bodyStr)
    };
    if (method === "POST" && path.includes("/docs") && body && body.query) {
      headers["x-ms-documentdb-isquery"] = "True";
      headers["x-ms-documentdb-query-enablecrosspartition"] = "True";
    }
    const options = { hostname: host, path: "/" + path, method, headers };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

module.exports = { request };
