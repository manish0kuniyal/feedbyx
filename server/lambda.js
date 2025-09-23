// lambda.js
import { createServer, proxy } from "@vendia/serverless-express";
import app from "./server.js";
import { connectDB } from "./utils/dbconnect.js";
let server;
let initPromise;

async function ensureServer() {
  if (server) return server;
  if (!initPromise) {
    initPromise = (async () => {
      // connect to DB once per container
      await connectDB();
      // create the vendia server wrapper so Express gets proper stream-like req/res
      server = createServer(app);
      return server;
    })();
  }
  return initPromise;
}

export const handler = async (event, context) => {
  // ensure initialization (DB + server wrapper) completed
  await ensureServer();
  // proxy the API Gateway event to the wrapped Express server
  return proxy(server, event, context);
};
