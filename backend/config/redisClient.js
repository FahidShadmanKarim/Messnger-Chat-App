const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Handle Redis errors
redisClient.on('error', (err) => {
  console.error('Redis error', err);
});

// Connect the Redis client
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected');

    // Example Redis set and get after connecting
    redisClient.set('test-key', 'value', redis.print);
    redisClient.get('test-key', (err, reply) => {
      if (err) {
        console.error('Error fetching key:', err);
      } else {
        console.log('Value:', reply);
      }
    });
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
};

// Export Redis client and the connect function
module.exports = { redisClient, connectRedis };
