const app = require('./app');
require('dotenv').config();

// Start background workers
require('./workers/email.worker')

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 QuickBite API running on port ${PORT}`);
    console.log(`📂 DB URL: ${process.env.DATABASE_URL ? 'Configured' : 'Missing!'}`);
    console.log(`🛠️ Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log('----------------------------------------------------');
});
