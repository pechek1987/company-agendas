module.exports = async function (context, req) {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  context.res = {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      status: "API is working",
      hasEndpoint: !!endpoint,
      hasKey: !!key,
      endpointPreview: endpoint ? endpoint.substring(0, 30) + "..." : "missing"
    })
  };
};
