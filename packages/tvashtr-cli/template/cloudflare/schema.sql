-- Orders table — stores every completed checkout submission
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,        -- UUID
  name            TEXT NOT NULL,           -- Customer full name
  email           TEXT NOT NULL DEFAULT '', -- Customer email (optional)
  phone           TEXT NOT NULL,           -- Customer phone number
  address         TEXT NOT NULL DEFAULT '{}', -- JSON: { line1, city, postcode, country }
  delivery_title  TEXT NOT NULL DEFAULT '', -- Selected delivery option title
  delivery_price  REAL NOT NULL DEFAULT 0, -- Delivery cost
  items           TEXT NOT NULL,           -- JSON array of cart items
  total           REAL NOT NULL,           -- Order total including delivery
  payment_method  TEXT NOT NULL DEFAULT 'payment_on_delivery',
  created_at      TEXT NOT NULL            -- ISO 8601 timestamp
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
