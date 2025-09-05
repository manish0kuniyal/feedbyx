
import { createClient } from 'redis';
const client = createClient({
 username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    // tls: true, // for Redis Cloud
  },
});

client.on('error', (err) => console.error('❌ Redis Client Error:', err));

let redisClient;

async function connectRedis() {
  if (!redisClient) {
    await client.connect();
    redisClient = client;
    console.log('✅ Connected to Redis Cloud');
  }
  return redisClient;
}

export default await connectRedis();
