
import serverless from "serverless-http";
import app from "./server.js";

// Wrap serverless-http to strip API Gateway's stage/prefix
const serverlessApp = serverless(app);
export const handler = async (event) => {
  console.log("✅ Lambda function invoked. Returning a successful response.");
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: "Hello from a simple Lambda function!" })
  };
};