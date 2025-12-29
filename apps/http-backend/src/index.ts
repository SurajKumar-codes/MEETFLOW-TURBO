import "dotenv/config";
import express from "express"
import meetingRoutes from "./routes/meetings";   

const app = express(); 
app.use(express.json());

app.use("/meetings", meetingRoutes);


app.listen(3001, () => {
  console.log("Speak, I am Listening on port 3001");
})