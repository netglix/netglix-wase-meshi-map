import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

type Row = {
  name?: string
  budget?: string
  open_hours?: string
  photo_url?: string
  comment?: string
  mood?: string
  lat?: string
  lng?: string
  approved?: string
}

let cache: { ts: number; data: any } | null = null

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const now = Date.now()
    if (cache && now - cache.ts < 5 * 60 * 1000) {
      return res.status(200).json(cache.data)
    }

    const dataPath = path.join(process.cwd(), 'data', 'restaurants.json')
    const local = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    let merged = Array.isArray(local) ? local.slice() : []

    const sheetUrl = process.env.GOOGLE_SHEET_CSV_URL
    if (sheetUrl) {
      const r = await fetch(sheetUrl)
      if (r.ok) {
        const csv = await r.text()
        const parsed = Papa.parse<Row>(csv, { header: true })
        const rows = parsed.data || []
        for (const row of rows) {
          const approved = (row.approved || '').toLowerCase()
          if (approved === 'true' || approved === '1' || approved === 'yes') {
            if (!row.name) continue
            const lat = row.lat ? Number(row.lat) : undefined
            const lng = row.lng ? Number(row.lng) : undefined
            merged.push({
              name: row.name,
              budget: row.budget || '',
              open_hours: row.open_hours || '',
              photo_url: row.photo_url || '',
              comment: row.comment || '',
              mood: row.mood || '',
              lat,
              lng,
              approved: true
            })
          }
        }
      }
    }

    // filter out entries without coords
    const final = merged.filter((m: any) => typeof m.lat === 'number' && typeof m.lng === 'number')

    cache = { ts: now, data: final }
    res.status(200).json(final)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed' })
  }
}
