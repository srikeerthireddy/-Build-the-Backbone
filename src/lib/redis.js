let redis

if (process.env.NODE_ENV === 'development') {
  // Use redis-mock for development/testing
  const redisMock = require('redis-mock')
  redis = redisMock.createClient()
  console.log('[Redis] Using in-memory mock for development')
} else {
  // Use ioredis for production
  const Redis = require('ioredis')
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy(times) {
      return Math.min(times * 50, 2000)
    }
  })
  redis.on('connect', () => console.log('[Redis] Connected'))
  redis.on('error', (err) => console.error('[Redis] Error:', err.message))
}

module.exports = redis
