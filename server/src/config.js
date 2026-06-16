import 'dotenv/config'

const num = (v, d) => (v == null || v === '' ? d : Number(v))
const str = (v, d) => (v == null || v === '' ? d : String(v))

export const config = {
  port: num(process.env.PORT, 4000),
  corsOrigin: str(process.env.CORS_ORIGIN, 'http://localhost:5173'),
  ingestApiKey: str(process.env.INGEST_API_KEY, ''),

  mqtt: {
    url: str(process.env.MQTT_URL, ''),
    username: str(process.env.MQTT_USERNAME, ''),
    password: str(process.env.MQTT_PASSWORD, ''),
    topicTelemetry: str(process.env.MQTT_TOPIC_TELEMETRY, 'rental/motor/+/telemetry'),
    topicHeartbeat: str(process.env.MQTT_TOPIC_HEARTBEAT, 'rental/system/heartbeat'),
  },

  store: str(process.env.STORE, 'memory'), // 'memory' | 'db'

  pg: {
    host: str(process.env.PGHOST, 'localhost'),
    port: num(process.env.PGPORT, 5432),
    database: str(process.env.PGDATABASE, 'fleettrack'),
    user: str(process.env.PGUSER, 'fleettrack'),
    password: str(process.env.PGPASSWORD, ''),
  },

  influx: {
    url: str(process.env.INFLUX_URL, 'http://localhost:8086'),
    token: str(process.env.INFLUX_TOKEN, ''),
    org: str(process.env.INFLUX_ORG, 'fleettrack'),
    bucket: str(process.env.INFLUX_BUCKET, 'telemetry'),
  },
}
