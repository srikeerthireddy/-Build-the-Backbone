const redis = require('./redis')

const invalidateRestaurantCache = async (city) => {
  try {
    // Clear all paginated cache keys for this city
    const keys = await redis.keys(`restaurants:city=${city}:*`)
    if (keys.length > 0) await redis.del(...keys)

    // Also clear the 'all' city cache
    const allKeys = await redis.keys('restaurants:city=all:*')
    if (allKeys.length > 0) await redis.del(...allKeys)
    
    console.log(`[Cache] Invalidated restaurant cache for city: ${city}`)
  } catch (err) {
    // Non-fatal - log and continue
    console.error('[Cache] Invalidation failed (non-fatal):', err.message)
  }
}

module.exports = { invalidateRestaurantCache }
