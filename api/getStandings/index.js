const { CosmosClient } = require("@azure/cosmos");
const client = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
const DB = "agendas", CONTAINER = "standings";
module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    const agendaKey = context.bindingData.agendaKey;
    const { resource } = await client.database(DB).container(CONTAINER).item(agendaKey, agendaKey).read();
    context.res.body = JSON.stringify(resource ? resource.items : null);
  } catch (err) {
    if (err.code === 404) {
      context.res.body = JSON.stringify(null);
    } else {
      context.res.status = 500;
      context.res.body = JSON.stringify({ error: err.message });
    }
  }
};
