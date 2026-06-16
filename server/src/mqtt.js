// MQTT subscriber (device → server). Connects to the Mosquitto broker and feeds
// every `rental/motor/{id}/telemetry` message into the ingest pipeline. Disabled
// when MQTT_URL is empty — the server then relies solely on HTTP ingest.

import mqtt from 'mqtt'

export function startMqtt(config, onTelemetry, log = console) {
  if (!config.mqtt.url) {
    log.info('[mqtt] disabled (MQTT_URL empty) — using HTTP ingest only')
    return null
  }

  const client = mqtt.connect(config.mqtt.url, {
    username: config.mqtt.username || undefined,
    password: config.mqtt.password || undefined,
    reconnectPeriod: 3000,
    connectTimeout: 8000,
  })

  client.on('connect', () => {
    log.info(`[mqtt] connected to ${config.mqtt.url}`)
    client.subscribe(config.mqtt.topicTelemetry, { qos: 1 }, (err) => {
      if (err) log.error('[mqtt] subscribe failed:', err.message)
      else log.info(`[mqtt] subscribed to ${config.mqtt.topicTelemetry} (QoS 1)`)
    })
  })

  client.on('message', (topic, payload) => {
    if (!topic.endsWith('/telemetry')) return
    try {
      onTelemetry(JSON.parse(payload.toString()))
    } catch (err) {
      log.error('[mqtt] bad payload on', topic, '—', err.message)
    }
  })

  client.on('error', (err) => log.error('[mqtt] error:', err.message))
  client.on('reconnect', () => log.info('[mqtt] reconnecting…'))

  /** Publish a command back to a device (server → device, §III-D). */
  function sendCommand(deviceId, command) {
    const topic = `rental/motor/${deviceId}/cmd`
    client.publish(topic, JSON.stringify(command), { qos: 1 })
  }

  return { client, sendCommand }
}
