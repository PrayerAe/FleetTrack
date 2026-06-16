// Headless smoke test: load the app, collect console errors, screenshot each view.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:5173'
const OUT = 'scripts/shots'
mkdirSync(OUT, { recursive: true })

const views = [
  ['overview', 'Dashboard'],
  ['map', 'Live Map'],
  ['speed', 'Speed Monitor'],
  ['geofence', 'Geofence Manager'],
  ['fleet', 'Fleet Overview'],
  ['alerts', 'Alert Panel'],
  ['rentals', 'Rental Management'],
  ['analytics', 'Analytics'],
  ['research', 'Hasil Penelitian'],
  ['telemetry', 'Telemetry Console'],
]

const researchTabs = ['Novelty', 'Pencapaian KPI', 'Skalabilitas', 'Uji Lapangan', 'Akurasi & UX', 'Biaya & Dampak']

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUT}/overview.png` })

for (const [, label] of views.slice(1)) {
  const link = page.locator('aside button', { hasText: label }).first()
  await link.click()
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${OUT}/${label.toLowerCase().replace(/\s+/g, '-')}.png` })

  // capture each research sub-tab
  if (label === 'Hasil Penelitian') {
    for (const t of researchTabs) {
      await page.locator('button', { hasText: t }).first().click()
      await page.waitForTimeout(900)
      await page.screenshot({ path: `${OUT}/research-${t.toLowerCase().replace(/[\s&]+/g, '-')}.png` })
    }
  }
}

await browser.close()

if (errors.length) {
  console.log('CONSOLE ERRORS (' + errors.length + '):')
  for (const e of [...new Set(errors)]) console.log(' - ' + e)
  process.exitCode = 1
} else {
  console.log('OK — no console errors across all ' + views.length + ' views.')
}
