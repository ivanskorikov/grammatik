#!/usr/bin/env node
/**
 * Copies curated theory summaries into the generated section JSON files.
 * This does not require the private worksheet sources.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const summariesPath = path.join(root, 'content/summaries.json')
const sectionsPath = path.join(root, 'content/sections')

const summaries = JSON.parse(fs.readFileSync(summariesPath, 'utf8')) as Record<
  string,
  { blocks: unknown[] }
>

let synced = 0
for (const filename of fs.readdirSync(sectionsPath)) {
  if (!filename.endsWith('.json')) continue

  const filePath = path.join(sectionsPath, filename)
  const section = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
    id: string
    overview: { blocks: unknown[] }
  }
  const summary = summaries[section.id]
  if (!summary) {
    throw new Error(`No summary found for section "${section.id}"`)
  }

  section.overview = summary
  fs.writeFileSync(filePath, `${JSON.stringify(section, null, 2)}\n`)
  synced++
}

console.log(`Synced theory summaries into ${synced} section files.`)
