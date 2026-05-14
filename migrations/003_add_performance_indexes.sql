-- 003_add_performance_indexes.sql
-- Performance indexes based on EXPLAIN ANALYZE findings
-- These indexes target the N+1 query patterns and foreign key lookups

BEGIN;

-- Index on orders.user_id for filtering orders by user in getOrderHistory - prevents sequential scan on 5000 rows
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Index on order_items.order_id for joining order_items with orders - essential for aggregating items per order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Index on menu_items.restaurant_id for filtering menu items by restaurant - prevents sequential scan when fetching restaurant menu
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);

-- Index on categories.restaurant_id for filtering categories by restaurant - used when joining categories in menu query
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON categories(restaurant_id);

-- Index on restaurants.city for filtering restaurants by city - prevents sequential scan when filtering by location
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);

-- Composite index on menu_items for common queries - optimizes restaurant_id + available filter
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available ON menu_items(restaurant_id, available);

-- Index on orders.created_at for sorting order history by date - enables efficient DESC ordering
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

COMMIT;
