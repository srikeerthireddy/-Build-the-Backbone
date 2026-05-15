const emailService = require('../lib/emailService')

// In development, this is handled by the in-memory queue
// In production, this would be a full BullMQ worker
if (process.env.NODE_ENV !== 'development') {
  const { Worker } = require('bullmq')
  const redis = require('../lib/redis')
  
  const emailWorker = new Worker('email', async (job) => {
    const { orderId, userEmail, orderData } = job.data
    
    console.log(`[EmailWorker] Processing job ${job.id} for order #${orderId}`)
    
    await emailService.sendConfirmation(orderId, userEmail)
  }, {
    connection: redis,
    concurrency: 5
  })
  
  emailWorker.on('completed', (job) => {
    console.log(`[EmailWorker] Job ${job.id} completed`)
  })
  
  emailWorker.on('failed', (job, err) => {
    console.error(`[EmailWorker] Job ${job.id} failed:`, err.message)
  })
} else {
  // For development, set up the in-memory queue processor
  const emailQueue = require('../queues/email.queue')
  
  // Process emails from the in-memory queue
  setInterval(async () => {
    const jobs = emailQueue.jobs || []
    for (const job of jobs) {
      if (!job.processed) {
        try {
          const { orderId, userEmail } = job.data
          console.log(`[EmailWorker] Processing in-memory job ${job.id} for order #${orderId}`)
          await emailService.sendConfirmation(orderId, userEmail)
          job.processed = true
          console.log(`[EmailWorker] Job ${job.id} completed`)
        } catch (err) {
          console.error(`[EmailWorker] Job ${job.id} failed:`, err.message)
        }
      }
    }
  }, 100)
}
