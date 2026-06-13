const { CosmosClient } = require("@azure/cosmos");
const client = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
const DB = "agendas", CONTAINER = "history";
module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    const { agendaKey, date } = context.bindingData;
    const id = agendaKey + "_" + date;
    await client.database(DB).container(CONTAINER).item(id, agendaKey).delete();
    context.res.body = JSON.stringify({ success: true });
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
