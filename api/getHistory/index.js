const { request } = require("../cosmos");

module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    const agendaKey = context.bindingData.agendaKey;
    const result = await request("POST", "dbs/agendas/colls/history/docs", {
      query: "SELECT * FROM c WHERE c.agendaKey = @key ORDER BY c.date DESC",
      parameters: [{ name: "@key", value: agendaKey }]
    }, key, endpoint);
    context.res.body = JSON.stringify(result.body.Documents || []);
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
