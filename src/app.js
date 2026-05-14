const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('express-async-errors');

const authController = require('./controllers/auth.controller');
const restaurantController = require('./controllers/restaurant.controller');
const orderController = require('./controllers/order.controller');
const authMiddleware = require('./middleware/auth.middleware');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Query counting middleware for profiling
app.use((req, res, next) => {
  req._queryCount = 0;
  global.currentReq = req;
  res.on('finish', () => {
    global.currentReq = null;
    if (req._queryCount > 5) {
      console.log(
        `[QUERY COUNT] ${req.method} ${req.path} → ${req._queryCount} queries (${res.statusCode})`
      );
    }
  });
  next();
});

// Public Routes
app.get('/api/health', restaurantController.getHealth);
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/restaurants', restaurantController.getRestaurants);
app.get('/api/restaurants/:id/menu', restaurantController.getMenu);

// Authenticated Routes
app.use('/api/orders', authMiddleware);
app.post('/api/orders', orderController.createOrder);
app.get('/api/orders/history', orderController.getOrderHistory);
app.get('/api/orders/:id', orderController.getOrderById);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('[Global Error]', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
