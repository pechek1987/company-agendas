const { request } = require("../cosmos");

module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    const { agendaKey, date } = context.bindingData;
    const id = agendaKey + "_" + date;
    await request("DELETE", "dbs/agendas/colls/history/docs/" + id, null, key, endpoint);
    context.res.body = JSON.stringify({ success: true });
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
