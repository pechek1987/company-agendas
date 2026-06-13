const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
  context.res = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  };
  try {
    const client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });
    const { agendaKey, items } = req.body;
    if (!agendaKey) {
      context.res.status = 400;
      context.res.body = JSON.stringify({ error: "Missing agendaKey" });
      return;
    }
    const { resource } = await client
      .database("agendas")
      .container("standings")
      .items.upsert({ id: agendaKey, agendaKey, items });
    context.res.body = JSON.stringify(resource);
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
