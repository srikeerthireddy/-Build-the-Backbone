/**
 * In-memory queue for development/testing
 * Provides a queue-like interface without requiring Redis
 */

class InMemoryQueue {
  constructor(name) {
    this.name = name
    this.jobs = []
    this.handlers = []
  }

  async add(jobType, data) {
    const job = {
      id: Math.random().toString(36).substr(2, 9),
      type: jobType,
      data,
      attempts: 0,
      maxAttempts: 3
    }
    
    this.jobs.push(job)
    this._processJob(job)
    
    return job
  }

  async _processJob(job) {
    // Process job asynchronously
    process.nextTick(async () => {
      try {
        for (const handler of this.handlers) {
          await handler(job)
        }
        console.log(`[InMemoryQueue] Job ${job.id} processed`)
      } catch (err) {
        console.error(`[InMemoryQueue] Job ${job.id} failed:`, err.message)
      }
    })
  }

  on(event, callback) {
    if (event === 'completed' || event === 'failed') {
      // Handle event listeners if needed
    }
  }
}

module.exports = InMemoryQueue
