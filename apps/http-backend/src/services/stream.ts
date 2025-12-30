
// import {env} from "@repo/config/config"
import { StreamClient } from "@stream-io/node-sdk";

export const streamServer = new StreamClient(
  process.env.STREAM_API_KEY || "",
  process.env.STREAM_SECRET_KEY || "",
);

