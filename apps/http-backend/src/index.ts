import "dotenv/config";
import express from "express"
import meetingRoutes from "./routes/meetings";   
import cors from "cors"

const app = express(); 


app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use(express.json());

app.use("/meetings", meetingRoutes);


app.listen(3001, () => {
  console.log("Speak, I am Listening on port 3001");
})