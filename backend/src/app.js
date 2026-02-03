const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
const { logger } = require("./logger");
const healthRoutes = require("./routes/health");
const bookRoutes = require("./routes/books");
const memberRoutes = require("./routes/members");
const loanRoutes = require("./routes/loans");
const { errorHandler } = require("./middleware/errorHandler");

const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger }));

  app.use("/health", healthRoutes);
  app.use("/api/books", bookRoutes);
  app.use("/api/members", memberRoutes);
  app.use("/api/loans", loanRoutes);

  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
