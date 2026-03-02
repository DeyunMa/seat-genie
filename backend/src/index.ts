import { createApp } from "./app";
import { config } from "./config/env";
import { logger } from "./logger";
import { startScheduler } from "./services/schedulerService";

const app = createApp();

app.listen(config.port, () => {
  logger.info({ port: config.port }, "API server listening");
  startScheduler();
});
