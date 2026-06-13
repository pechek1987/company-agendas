const { CosmosClient } = require("@azure/cosmos");
const client = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
const DB = "agendas", CONTAINER = "history";
module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    const agendaKey = context.bindingData.agendaKey;
    const { resources } = await client.database(DB).container(CONTAINER).items
      .query({ query: "SELECT * FROM c WHERE c.agendaKey = @key ORDER BY c.date DESC", parameters: [{ name: "@key", value: agendaKey }] })
      .fetchAll();
    context.res.body = JSON.stringify(resources);
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
