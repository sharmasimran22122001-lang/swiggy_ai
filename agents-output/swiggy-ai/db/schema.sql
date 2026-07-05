-- ============================================================
-- SWIGGY AI — PostgreSQL Schema (run in Supabase SQL Editor)
-- ============================================================

-- Restaurants (8,680 real rows from Kaggle)
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT,
  city TEXT,
  price_for_two NUMERIC,
  avg_rating NUMERIC,
  total_ratings INTEGER,
  delivery_time_min INTEGER
);

-- Cuisines per restaurant (normalised many-to-many)
CREATE TABLE IF NOT EXISTS restaurant_cuisines (
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  cuisine TEXT NOT NULL,
  PRIMARY KEY (restaurant_id, cuisine)
);

-- Synthesized dish menus (~10 dishes per restaurant)
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  dish TEXT NOT NULL,
  veg BOOLEAN NOT NULL,
  price NUMERIC NOT NULL
);

-- Demo users (4 synthetic personas)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  area TEXT,
  declared_diet TEXT DEFAULT 'none'
);

-- Order history per user
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER,
  restaurant_name TEXT,
  dish TEXT,
  veg BOOLEAN,
  price NUMERIC,
  cuisine TEXT,
  days_ago INTEGER
);

-- Cached homepage JSON (avoids repeat Gemini calls)
CREATE TABLE IF NOT EXISTS homepage_cache (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  slot TEXT NOT NULL,
  homepage_json JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trending foods cache (populated by Trend Research Agent daily)
CREATE TABLE IF NOT EXISTS trending_foods (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  city         TEXT NOT NULL,
  item_name    TEXT NOT NULL,
  cuisine      TEXT,
  why_trending TEXT,
  search_signal TEXT,
  fetched_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_area ON restaurants(area);
CREATE INDEX IF NOT EXISTS idx_restaurant_cuisines_rid ON restaurant_cuisines(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_rid ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cache_user_slot ON homepage_cache(user_id, slot);
CREATE INDEX IF NOT EXISTS idx_trending_city_time ON trending_foods(city, fetched_at DESC);

-- Enable Row Level Security (read-only public access for demo)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "public read cuisines"    ON restaurant_cuisines FOR SELECT USING (true);
CREATE POLICY "public read menu"        ON menu_items FOR SELECT USING (true);
CREATE POLICY "public read users"       ON users FOR SELECT USING (true);
CREATE POLICY "public read orders"      ON orders FOR SELECT USING (true);
CREATE POLICY "public read cache"       ON homepage_cache FOR SELECT USING (true);

ALTER TABLE trending_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read trending"   ON trending_foods FOR SELECT USING (true);
CREATE POLICY "service insert trending" ON trending_foods FOR INSERT WITH CHECK (true);

-- Service role can write everything (used by seed endpoint)
CREATE POLICY "service insert restaurants" ON restaurants FOR INSERT WITH CHECK (true);
CREATE POLICY "service insert cuisines"    ON restaurant_cuisines FOR INSERT WITH CHECK (true);
CREATE POLICY "service insert menu"        ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "service insert users"       ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "service insert orders"      ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "service insert cache"       ON homepage_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "service update cache"       ON homepage_cache FOR UPDATE USING (true);
CREATE POLICY "service delete cache"       ON homepage_cache FOR DELETE USING (true);
