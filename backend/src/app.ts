import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { logger } from "./logger";
import { authenticate } from "./middleware/auth";
import { authorize } from "./middleware/authorize";
import { buildErrorPayload } from "./utils/errors";
import healthRoutes from "./routes/health";
import { publicRouter as publicUserRouter, protectedRouter as protectedUserRouter } from "./routes/users";
import roomRoutes from "./routes/rooms";
import seatRoutes from "./routes/seats";
import reservationRoutes from "./routes/reservations";
import notificationRoutes from "./routes/notifications";
import bookRoutes from "./routes/books";
import authorRoutes from "./routes/authors";
import memberRoutes from "./routes/members";
import loanRoutes from "./routes/loans";
import reportRoutes from "./routes/reports";
import exportRoutes from "./routes/export";
import schedulerRoutes from "./routes/scheduler";
import campusRoutes from "./routes/campuses";
import { errorHandler } from "./middleware/errorHandler";

const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger: logger as any }));

  // Public routes (no auth required)
  app.use("/health", healthRoutes);

  // Public user routes (e.g., login)
  app.use("/api/users", publicUserRouter);

  // Apply JWT authentication to all other API routes
  app.use("/api", authenticate);

  // Protected routes — admin only
  app.use("/api/users", authorize("admin"), protectedUserRouter);

  // Protected routes — admin only
  app.use("/api/campuses", authorize("admin"), campusRoutes);
  app.use("/api/scheduler", authorize("admin"), schedulerRoutes);

  // Protected routes — staff & admin
  app.use("/api/books", authorize("admin", "staff"), bookRoutes);
  app.use("/api/authors", authorize("admin", "staff"), authorRoutes);
  app.use("/api/members", authorize("admin", "staff"), memberRoutes);
  app.use("/api/loans", authorize("admin", "staff"), loanRoutes);
  app.use("/api/reports", authorize("admin", "staff"), reportRoutes);
  app.use("/api/export", authorize("admin", "staff"), exportRoutes);

  // Protected routes — all authenticated users (rooms/seats readable by students for reservations)
  app.use("/api/rooms", roomRoutes);
  app.use("/api/seats", seatRoutes);
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/notifications", notificationRoutes);

  // 404 handler for unknown API routes
  app.use("/api", (req: Request, res: Response) => {
    res.status(404).json(buildErrorPayload({
      message: `Cannot ${req.method} ${req.originalUrl}`,
      code: "NOT_FOUND",
    }));
  });

  app.use(errorHandler);

  return app;
};

export { createApp };
