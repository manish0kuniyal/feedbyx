
import serverless from "serverless-http";
import app from "./server.js";

// Wrap serverless-http to strip API Gateway's stage/prefix
const serverlessApp = serverless(app);

export const handler = async (event, context) => {
  // // If API Gateway sends a prefixed path, strip it
  // if (event.rawPath && event.rawPath.startsWith("/lambda-gh-action")) {
  //   event.rawPath = event.rawPath.replace("/lambda-gh-action", "") || "/";
  // }

  return serverlessApp(event, context);
};
