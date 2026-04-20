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

app.use("/meetings", meetingRoutes);


app.listen(3001, () => {
  console.log("Speak, I am Listening on port 3001");
})