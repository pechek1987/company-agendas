module.exports = function(context, req) {
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: "{ \"ok\": true }"
  };
  context.done();
};
