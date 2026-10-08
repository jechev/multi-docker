const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
});
const sub = redisClient.duplicate();

redisClient.on('error', (err) => console.log('Redis error', err));
sub.on('error', (err) => console.log('Redis sub error', err));

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

(async () => {
  await redisClient.connect();
  await sub.connect();

  await sub.subscribe('insert', async (message) => {
    await redisClient.hSet('values', message, fib(parseInt(message)));
  });
})();