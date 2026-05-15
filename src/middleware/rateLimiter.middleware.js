const redis = require('../lib/redis')

/**
 * Rate limiting middleware for POST /orders
 * 
 * Limit: 10 requests per minute per authenticated user
 * Algorithm: Fixed window counter using redis.incr() + redis.expire()
 */
const orderRateLimit = async (req, res, next) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const key = `ratelimit:user:${userId}:orders`
  const limit = 10
  const windowSeconds = 60

  try {
    const current = await redis.incr(key)
    
    // First request in this window - set expiry
    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }

    const remaining = Math.max(0, limit - current)
    
    res.set('X-RateLimit-Limit', String(limit))
    res.set('X-RateLimit-Remaining', String(remaining))

    if (current > limit) {
      const ttl = await redis.ttl(key)
      const retryAfter = Math.max(1, ttl)
      
      res.set('Retry-After', String(retryAfter))
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Max ${limit} requests per ${windowSeconds}s. Retry after ${retryAfter}s.`,
        retryAfter
      })
    }

    next()
  } catch (err) {
    console.error('[RateLimit] Redis error (non-fatal):', err.message)
    // On error, allow request to proceed
    next()
  }
}

module.exports = orderRateLimit
