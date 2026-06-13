const { request } = require("../cosmos");

module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    const agendaKey = context.bindingData.agendaKey;
    const result = await request("GET", "dbs/agendas/colls/standings/docs/" + agendaKey, null, key, endpoint);
    if (result.status === 404) {
      context.res.body = JSON.stringify(null);
    } else {
      context.res.body = JSON.stringify(result.body ? result.body.items : null);
    }
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
