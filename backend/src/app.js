const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
const { logger } = require("./logger");
const { authenticate } = require("./middleware/auth");
const healthRoutes = require("./routes/health");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");
const seatRoutes = require("./routes/seats");
const reservationRoutes = require("./routes/reservations");
const notificationRoutes = require("./routes/notifications");
const bookRoutes = require("./routes/books");
const authorRoutes = require("./routes/authors");
const memberRoutes = require("./routes/members");
const loanRoutes = require("./routes/loans");
const reportRoutes = require("./routes/reports");
const { errorHandler } = require("./middleware/errorHandler");

const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger }));

  // Public routes (no auth required)
  app.use("/health", healthRoutes);
  app.post("/api/users/login", userRoutes);

  // Apply JWT authentication to all other API routes
  app.use("/api", authenticate);

  // Protected routes
  app.use("/api/users", userRoutes);
  app.use("/api/rooms", roomRoutes);
  app.use("/api/seats", seatRoutes);
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/books", bookRoutes);
  app.use("/api/authors", authorRoutes);
  app.use("/api/members", memberRoutes);
  app.use("/api/loans", loanRoutes);
  app.use("/api/reports", reportRoutes);

  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
