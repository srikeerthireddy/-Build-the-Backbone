const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Track queries in current request context
let currentReq = null;

module.exports = {
  /**
   * Execute a SQL query.
   * Logs duration and query text if LOG_QUERIES is set.
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.LOG_QUERIES === 'true') {
        console.log('[DB Query]', {
          text: text.replace(/\s+/g, ' ').trim().substring(0, 100),
          duration: `${duration}ms`,
          rows: res.rowCount,
        });
      }
      
      // Track query count if in request context
      if (global.currentReq) {
        global.currentReq._queryCount++;
      }
      
      return res;
    } catch (err) {
      console.error('[DB Error]', err.stack);
      throw err;
    }
  },
  
  // Expose pool for transactions or advanced usage
  pool,
  
  // Set request context for query tracking
  setRequestContext(req) {
    global.currentReq = req;
  }
};
