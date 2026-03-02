const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
const { logger } = require("./logger");
const { authenticate } = require("./middleware/auth");
const { authorize } = require("./middleware/authorize");
const { buildErrorPayload } = require("./utils/errors");
const healthRoutes = require("./routes/health");
const { publicRouter: publicUserRouter, protectedRouter: protectedUserRouter } = require("./routes/users");
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

  // Public user routes (e.g., login)
  app.use("/api/users", publicUserRouter);

  // Apply JWT authentication to all other API routes
  app.use("/api", authenticate);

  // Protected routes — admin only
  app.use("/api/users", authorize("admin"), protectedUserRouter);

  // Protected routes — staff & admin
  app.use("/api/rooms", authorize("admin", "staff"), roomRoutes);
  app.use("/api/seats", authorize("admin", "staff"), seatRoutes);
  app.use("/api/books", authorize("admin", "staff"), bookRoutes);
  app.use("/api/authors", authorize("admin", "staff"), authorRoutes);
  app.use("/api/members", authorize("admin", "staff"), memberRoutes);
  app.use("/api/loans", authorize("admin", "staff"), loanRoutes);
  app.use("/api/reports", authorize("admin", "staff"), reportRoutes);

  // Protected routes — all authenticated users
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/notifications", notificationRoutes);

  // 404 handler for unknown API routes
  app.use("/api", (req, res) => {
    res.status(404).json(buildErrorPayload({
      message: `Cannot ${req.method} ${req.originalUrl}`,
      code: "NOT_FOUND",
    }));
  });

  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
