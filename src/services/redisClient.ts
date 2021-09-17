import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    url: process.env.REDIS_URL,
  },
});

redisClient.on('error', err => console.log('Redis Client Error', err));

redisClient.connect();

export default redisClient;
