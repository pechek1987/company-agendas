const { request } = require("../cosmos");

module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    const { agendaKey, items } = req.body;
    if (!agendaKey) {
      context.res.status = 400;
      context.res.body = JSON.stringify({ error: "Missing agendaKey" });
      return;
    }
    const doc = { id: agendaKey, agendaKey, items };
    const result = await request("POST", "dbs/agendas/colls/standings/docs", doc, key, endpoint);
    if (result.status === 409) {
      const upResult = await request("PUT", "dbs/agendas/colls/standings/docs/" + agendaKey, doc, key, endpoint);
      context.res.body = JSON.stringify(upResult.body);
    } else {
      context.res.body = JSON.stringify(result.body);
    }
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
