let emailQueue

if (process.env.NODE_ENV === 'development') {
  // Use in-memory queue for development
  const InMemoryQueue = require('../lib/inMemoryQueue')
  emailQueue = new InMemoryQueue('email')
  console.log('[EmailQueue] Using in-memory queue for development')
} else {
  // Use BullMQ for production
  const { Queue } = require('bullmq')
  const redis = require('../lib/redis')
  
  emailQueue = new Queue('email', {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 500
    }
  })
}

module.exports = emailQueue
