const { CosmosClient } = require("@azure/cosmos");
const client = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
const DB = "agendas", CONTAINER = "history";
async function ensureDB() {
  await client.databases.createIfNotExists({ id: DB });
  await client.database(DB).containers.createIfNotExists({ id: CONTAINER, partitionKey: { paths: ["/agendaKey"] } });
}
module.exports = async function (context, req) {
  context.res = { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } };
  try {
    await ensureDB();
    const record = req.body;
    if (!record || !record.agendaKey || !record.date) {
      context.res.status = 400;
      context.res.body = JSON.stringify({ error: "Missing agendaKey or date" });
      return;
    }
    record.id = record.agendaKey + "_" + record.date;
    const { resource } = await client.database(DB).container(CONTAINER).items.upsert(record);
    context.res.body = JSON.stringify(resource);
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
