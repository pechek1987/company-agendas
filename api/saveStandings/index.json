const { CosmosClient } = require("@azure/cosmos");
const client = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
const DB = "agendas", CONTAINER = "standings";
async function ensureDB() {
  await client.databases.createIfNotExists({ id: DB });
  await client.database(DB).containers.createIfNotExists({ id: CONTAINER, partitionKey: { paths: ["/id"] } });
}
module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    await ensureDB();
    const { agendaKey, items } = req.body;
    if (!agendaKey) {
      context.res.status = 400;
      context.res.body = JSON.stringify({ error: "Missing agendaKey" });
      return;
    }
    const { resource } = await client.database(DB).container(CONTAINER).items.upsert({ id: agendaKey, agendaKey, items });
    context.res.body = JSON.stringify(resource);
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
