// Persistence abstraction. Default `memory` keeps everything in RAM (the server
// runs with zero external services). Setting STORE=db enables the dual-database
// design from §III-E of the proposal: time-series telemetry → InfluxDB, and
// relational state (alerts, device status) → PostgreSQL.
//
// The `pg` and @influxdata/influxdb-client packages are optionalDependencies and
// are imported lazily, so the memory store has no native/runtime cost.

export async function createStore(config, log = console) {
  if (config.store !== 'db') {
    log.info('[store] using in-memory store (set STORE=db for PostgreSQL + InfluxDB)')
    return new MemoryStore()
  }
  try {
    const store = new DbStore(config, log)
    await store.init()
    log.info('[store] dual-database store ready (PostgreSQL + InfluxDB)')
    return store
  } catch (err) {
    log.error('[store] failed to init dual-database store — falling back to memory:', err.message)
    return new MemoryStore()
  }
}

class MemoryStore {
  async writeTelemetry() {}
  async writeAlert() {}
  async upsertDeviceStatus() {}
  async close() {}
}

class DbStore {
  constructor(config, log) {
    this.config = config
    this.log = log
    this.pg = null
    this.influxWrite = null
    this.Point = null
  }

  async init() {
    const { default: pg } = await import('pg')
    const { InfluxDB, Point } = await import('@influxdata/influxdb-client')

    this.pg = new pg.Pool({
      host: this.config.pg.host,
      port: this.config.pg.port,
      database: this.config.pg.database,
      user: this.config.pg.user,
      password: this.config.pg.password,
    })
    await this.pg.query('SELECT 1')

    const influx = new InfluxDB({ url: this.config.influx.url, token: this.config.influx.token })
    this.influxWrite = influx.getWriteApi(this.config.influx.org, this.config.influx.bucket, 'ms')
    this.Point = Point
  }

  async writeTelemetry(t) {
    try {
      const point = new this.Point('telemetry')
        .tag('device_id', t.id)
        .tag('status', t.st)
        .floatField('lat', t.lat)
        .floatField('lng', t.lng)
        .floatField('spd', t.spd)
        .intField('bat', Math.round(t.bat))
        .intField('sat', Math.round(t.sat))
        .timestamp(new Date(t.ts))
      this.influxWrite.writePoint(point)
    } catch (err) {
      this.log.error('[influx] write failed:', err.message)
    }
  }

  async writeAlert(a) {
    try {
      await this.pg.query(
        `INSERT INTO alerts (id, time, device_id, type, severity, detail, live)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [a.id, a.time, a.device_id, a.type, a.severity, a.detail, a.live ?? true],
      )
    } catch (err) {
      this.log.error('[pg] alert insert failed:', err.message)
    }
  }

  async upsertDeviceStatus(m) {
    try {
      await this.pg.query(
        `UPDATE motorcycles
            SET status=$2, odometer=$3, last_seen=$4
          WHERE device_id=$1`,
        [m.device_id, m.status, m.odometer, m.lastSeen],
      )
    } catch (err) {
      this.log.error('[pg] device update failed:', err.message)
    }
  }

  async close() {
    try {
      await this.influxWrite?.close()
    } catch {}
    try {
      await this.pg?.end()
    } catch {}
  }
}
