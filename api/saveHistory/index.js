const { request } = require("../cosmos");

module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    const record = req.body;
    if (!record || !record.agendaKey || !record.date) {
      context.res.status = 400;
      context.res.body = JSON.stringify({ error: "Missing agendaKey or date" });
      return;
    }
    record.id = record.agendaKey + "_" + record.date;
    const result = await request("POST", "dbs/agendas/colls/history/docs", record, key, endpoint);
    if (result.status === 409) {
      const upResult = await request("PUT", "dbs/agendas/colls/history/docs/" + record.id, record, key, endpoint);
      context.res.body = JSON.stringify(upResult.body);
    } else {
      context.res.body = JSON.stringify(result.body);
    }
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
