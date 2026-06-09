import "dotenv/config";
import express from "express"
import meetingRoutes from "./routes/meetings";   
import cors from "cors"

const app = express(); 

const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://localhost:3002")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isLocalhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const isConfiguredOrigin = allowedOrigins.includes(origin);

      if (isLocalhostOrigin || isConfiguredOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin denied"));
    },
    credentials: true,
  })
);


app.use(express.json());

// Health check (used by Render and uptime probes)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/meetings", meetingRoutes);


const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Speak, I am Listening on port ${PORT}`);
})