const { createApp } = require("./app");
const { config } = require("./config/env");
const { logger } = require("./logger");

const app = createApp();

app.listen(config.port, () => {
  logger.info({ port: config.port }, "API server listening");
});
