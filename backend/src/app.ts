import express from "express";
import cors from "cors";
import apiRouter from "./routes/api";

const app = express();

// Middleware
app.use(cors({ origin: "*" })); // Configure strictly for production
app.use(express.json());

// Routes
app.use("/api", apiRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

export default app;
