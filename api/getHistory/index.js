const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
  context.res = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  };
  try {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    if (!endpoint || !key) {
      context.res.status = 500;
      context.res.body = JSON.stringify({ error: "Missing COSMOS_ENDPOINT or COSMOS_KEY" });
      return;
    }
    const client = new CosmosClient({ endpoint, key });
    const agendaKey = context.bindingData.agendaKey;
    const { resources } = await client
      .database("agendas")
      .container("history")
      .items.query({
        query: "SELECT * FROM c WHERE c.agendaKey = @key ORDER BY c.date DESC",
        parameters: [{ name: "@key", value: agendaKey }]
      })
      .fetchAll();
    context.res.body = JSON.stringify(resources);
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message, stack: err.stack });
  }
};
