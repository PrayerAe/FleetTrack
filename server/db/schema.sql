-- FleetTrack Manado — PostgreSQL schema (relational layer of the dual-database
-- design, §III-E). Time-series telemetry lives in InfluxDB, not here.
--
--   createdb fleettrack && psql fleettrack -f server/db/schema.sql
--
-- Enable persistence with STORE=db in server/.env.

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS motorcycles (
  device_id    TEXT PRIMARY KEY,
  model        TEXT NOT NULL,
  plat         TEXT NOT NULL,
  base_status  TEXT NOT NULL DEFAULT 'available',  -- rented | available | maintenance
  status       TEXT NOT NULL DEFAULT 'available',  -- live display status (incl. alert)
  area         TEXT,
  street       TEXT,
  speed_limit  INTEGER NOT NULL DEFAULT 60,
  odometer     DOUBLE PRECISION NOT NULL DEFAULT 0,
  last_seen    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS geofences (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  polygon   JSONB NOT NULL,            -- array of [lng, lat] vertices
  active    BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS rentals (
  id            TEXT PRIMARY KEY,
  device_id     TEXT REFERENCES motorcycles(device_id),
  user_id       INTEGER REFERENCES users(id),
  renter_name   TEXT,
  start_at      TIMESTAMPTZ NOT NULL,
  duration_days INTEGER NOT NULL,
  tarif         INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Aktif'       -- Aktif | Selesai
);

CREATE TABLE IF NOT EXISTS alerts (
  id          TEXT PRIMARY KEY,
  time        TIMESTAMPTZ NOT NULL,
  device_id   TEXT REFERENCES motorcycles(device_id),
  type        TEXT NOT NULL,
  severity    TEXT NOT NULL,
  detail      TEXT,
  live        BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_alerts_time   ON alerts (time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_device ON alerts (device_id);
CREATE INDEX IF NOT EXISTS idx_rentals_device ON rentals (device_id);
