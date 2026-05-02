import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import notificationRoutes from "./routes/notificationRoutes";
import { Log } from "../logging_middleware_local/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/notifications", notificationRoutes);

app.use(errorHandler);

app.listen(config.port, async () => {
  await Log("backend", "info", "config", `Server started successfully on port ${config.port}`);
  console.log(`[server] Listening on http://localhost:${config.port}`);
});

export default app;
