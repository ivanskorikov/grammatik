#!/usr/bin/env node
/**
 * Parses Nancy Thuleen HTML worksheets + answer keys into JSON content.
 * Run: npm run parse
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MATERIALS = path.join(ROOT, 'materials/html_textbook/grammar_pages')
const CONTENT = path.join(ROOT, 'content/sections')
const CURRICULUM_PATH = path.join(ROOT, 'content/curriculum.json')
const SUMMARIES_PATH = path.join(ROOT, 'content/summaries.json')

interface CurriculumEntry {
  id: string
  level: 'A1' | 'A2'
  title: string
  group: string
  sourceFile: string
  overviewSource?: string
  topic?: string
}

interface OverviewBlock {
  type: 'heading' | 'paragraph' | 'table' | 'list' | 'example'
  content: string
  rows?: string[][]
  de?: string
  note?: string
}

interface BlankDef {
  index: number
  accept: string[]
  hint: string | null
}

interface ExerciseItem {
  id: string
  prompt: string
  promptParts?: string[]
  blanks?: BlankDef[]
  wordBank?: string[]
  acceptFull?: string[]
  explanation?: { rule: string; topic: string }
}

interface Exercise {
  id: string
  type: string
  instructions: string
  items: ExerciseItem[]
}

interface GrammarSection {
  id: string
  level: 'A1' | 'A2'
  title: string
  group: string
  sourceFile: string
  overviewSource?: string
  overview: { blocks: OverviewBlock[] }
  exercises: Exercise[]
}

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&#8217;': "'",
  '&#8216;': "'",
  '&#8220;': '"',
  '&#8221;': '"',
  '&#8226;': '·',
  '&#8211;': '–',
  '&#8212;': '—',
  '&#187;': '»',
  '&#171;': '«',
  '&#223;': 'ß',
  '&#228;': 'ä',
  '&#246;': 'ö',
  '&#252;': 'ü',
  '&#196;': 'Ä',
  '&#214;': 'Ö',
  '&#220;': 'Ü',
  '&auml;': 'ä',
  '&ouml;': 'ö',
  '&uuml;': 'ü',
  '&Auml;': 'Ä',
  '&Ouml;': 'Ö',
  '&Uuml;': 'Ü',
  '&szlig;': 'ß',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#228;': 'ä',
  '&#246;': 'ö',
  '&#252;': 'ü',
}

function readHtml(filename: string): string {
  const fp = path.join(MATERIALS, filename)
  if (!fs.existsSync(fp)) return ''
  const buf = fs.readFileSync(fp)
  return buf.toString('latin1')
}

function decodeEntities(text: string): string {
  let s = text
  for (const [ent, ch] of Object.entries(ENTITY_MAP)) {
    s = s.split(ent).join(ch)
  }
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  return s
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

function extractAnswers(html: string): string[] {
  const answers: string[] = []
  const re = /<span class="answer">([\s\S]*?)<\/span>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    answers.push(stripTags(m[1]))
  }
  return answers
}

function extractHints(html: string): string[] {
  const hints: string[] = []
  const re = /<span class="parenital">\(([^)]*)\)<\/span>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    hints.push(m[1])
  }
  return hints
}

function splitSections(html: string): { letter: string; header: string; body: string }[] {
  const content = html.replace(/[\s\S]*?<tr><td class="norm" align="left" valign="top">\s*$/m, '')
  const mainMatch = html.match(
    /<tr><td class="norm" align="left" valign="top">([\s\S]*?)<\/td><\/tr>\s*<tr><td class="norm" align="right"/,
  )
  const main = mainMatch ? mainMatch[1] : html

  const parts = main.split(/<span class="norm"><b>([A-Z])\.\s*([^<]*)<\/b>/)
  const sections: { letter: string; header: string; body: string }[] = []

  for (let i = 1; i < parts.length; i += 3) {
    const letter = parts[i]
    const header = stripTags(parts[i + 1] ?? '')
    const body = parts[i + 2] ?? ''
    sections.push({ letter, header, body })
  }
  return sections
}

function extractInstructions(body: string): string {
  const m = body.match(/<i>([\s\S]*?)<\/i>/)
  return m ? stripTags(m[1]) : ''
}

function shouldSkipSection(header: string, instructions: string, body: string): boolean {
  const combined = `${header} ${instructions} ${body}`.toLowerCase()
  if (combined.includes('stammbaum') || combined.includes('family tree')) return true
  if (combined.includes('partner') && combined.includes('aktivit')) return true
  if (combined.includes('klassenspiel')) return true
  if (combined.includes('circle') && combined.includes('underline')) return true
  if (combined.includes('place an "s"') || combined.includes('place an &#8220;s&#8221;'))
    return true
  if (body.includes('.gif') || body.includes('.jpg')) return true
  return false
}

function extractWordBank(body: string): string[] | null {
  const bankMatch = body.match(
    /<td class="norm" bgcolor="#FFFFFF"[^>]*>([^<]*(?:&#8226;|·)[^<]*)<\/td>/,
  )
  if (!bankMatch) return null
  const text = stripTags(bankMatch[1])
  return text
    .split(/[·•]/)
    .map((w) => w.trim())
    .filter(Boolean)
}

function extractNumberedItems(body: string): string[] {
  const items: string[] = []
  const rowRe =
    /<tr>[\s\S]*?<td[^>]*>\s*(\d+)\.\s*<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/gi
  let m: RegExpExecArray | null
  while ((m = rowRe.exec(body)) !== null) {
    const cellHtml = m[2]
    if (cellHtml.includes('________') && cellHtml.length < 200) continue
    const text = stripTags(cellHtml.replace(/<span class="parenital">[^<]*<\/span>/gi, ''))
    if (text.length > 5) items.push(text)
  }

  if (items.length === 0) {
    const simpleRe = /(\d+)\.\s*([^<\n]+(?:_{3,}[^<\n]*)?)/g
    while ((m = simpleRe.exec(stripTags(body))) !== null) {
      if (m[2].trim().length > 5) items.push(m[2].trim())
    }
  }

  return items
}

function extractSentenceItems(body: string): { prompt: string; isAnswerLine: boolean }[] {
  const results: { prompt: string; isAnswerLine: boolean }[] = []
  const lines = body.split(/<tr>/)
  for (const line of lines) {
    const numMatch = line.match(/>\s*(\d+)\.\s*</)
    if (!numMatch) continue
    const cells = [...line.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1])
    if (cells.length >= 2) {
      const prompt = stripTags(cells[1])
      if (prompt.length > 10) {
        results.push({ prompt, isAnswerLine: false })
        if (cells.length >= 3 && cells[2].includes('________')) {
          results.push({ prompt: '', isAnswerLine: true })
        }
      }
    }
    const blankLine = line.match(/_{10,}/)
    if (blankLine && results.length > 0) {
      results.push({ prompt: '', isAnswerLine: true })
    }
  }
  return results
}

function blanksFromPrompt(prompt: string): { parts: string[]; count: number } {
  const parts = prompt.split(/_{3,}/)
  return { parts, count: parts.length - 1 }
}

function classifyType(
  body: string,
  items: string[],
  wordBank: string[] | null,
  hasInlineBlanks: boolean,
): string {
  if (wordBank) return 'word_bank'
  const hasVerbHint = body.includes('parenital') && /\(m\)|\(f\)|\(n\)|\(pl\)|\(verb\)/i.test(body)
  const hasPartialBlank = items.some((it) => /_{3,}[a-zA-Zäöüß]|_[a-zA-Zäöüß].*_{3,}/.test(it))
  if (hasPartialBlank || (hasVerbHint && hasInlineBlanks)) return 'pick_and_type'
  if (hasInlineBlanks) return hasVerbHint ? 'fill_blank_with_hint' : 'fill_blank'
  const isSentenceCombine =
    body.toLowerCase().includes('sätze kombinieren') ||
    body.toLowerCase().includes('schreiben sie') ||
    body.includes('_{10,}')
  if (isSentenceCombine) return 'word_order'
  if (items.some((it) => it.includes('?'))) return 'free_text'
  return 'fill_blank'
}

function inferTopic(id: string): string {
  if (id.includes('akkus') || id.includes('nominakk')) return 'accusative-articles'
  if (id.includes('dativ')) return 'dative'
  if (id.includes('perfekt')) return 'perfekt'
  if (id.includes('wortstellung') || id.includes('konjunktion')) return 'word-order'
  if (id.includes('modal')) return 'verb-conjugation'
  if (id.includes('reflexiv')) return 'verb-conjugation'
  if (id.includes('sepprefix')) return 'verb-conjugation'
  if (id.includes('adjektiv')) return 'accusative-articles'
  return 'verb-conjugation'
}

function parseWorksheetSection(
  sectionLetter: string,
  header: string,
  instructions: string,
  body: string,
  answerBody: string,
  sourceBase: string,
  topic: string,
): Exercise | null {
  if (shouldSkipSection(header, instructions, body)) return null

  const wordBank = extractWordBank(body)
  const answerTexts = extractAnswers(answerBody)
  let answerIdx = 0

  const tableItems = extractNumberedItems(body)
  const hasLongBlanks = body.includes('_{10,}')
  const hasInlineBlanks = tableItems.some((it) => /_{3,}/.test(it)) || body.includes('________')

  const type = classifyType(body, tableItems, wordBank, hasInlineBlanks || body.includes('________'))

  const items: ExerciseItem[] = []

  if (type === 'word_order' || hasLongBlanks) {
    const sentenceItems = extractSentenceItems(body)
    let itemNum = 0
    for (let i = 0; i < sentenceItems.length; i++) {
      const si = sentenceItems[i]
      if (si.isAnswerLine || !si.prompt) continue
      itemNum++
      const accept: string[] = []
      while (answerIdx < answerTexts.length && answerTexts[answerIdx].length < 200) {
        accept.push(answerTexts[answerIdx])
        answerIdx++
        break
      }
      if (accept.length === 0 && answerIdx < answerTexts.length) {
        accept.push(answerTexts[answerIdx++])
      }
      if (accept.length === 0) continue
      items.push({
        id: `${sourceBase}-${sectionLetter}-${itemNum}`,
        prompt: si.prompt,
        acceptFull: accept,
        explanation: { rule: '', topic },
      })
    }
  } else if (wordBank) {
    const prompts = body.match(/<td class="norm"[^>]*>([^<]*_{3,}[^<]*)<\/td>/gi) ?? []
    let itemNum = 0
    for (const p of prompts) {
      const text = stripTags(p)
      if (!/_{3,}/.test(text)) continue
      itemNum++
      const { parts, count } = blanksFromPrompt(text)
      const blanks: BlankDef[] = []
      for (let b = 0; b < count; b++) {
        const ans = answerTexts[answerIdx++] ?? ''
        if (!ans) break
        blanks.push({ index: b, accept: [ans], hint: null })
      }
      if (blanks.length === 0) continue
      items.push({
        id: `${sourceBase}-${sectionLetter}-${itemNum}`,
        prompt: text.replace(/_{3,}/g, '___'),
        promptParts: parts.map((p) => p.trim()),
        blanks,
        wordBank,
        explanation: { rule: '', topic },
      })
    }
  } else {
    const rowRe =
      /<tr>[\s\S]*?<td[^>]*>\s*(\d+)\.\s*<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/gi
    let m: RegExpExecArray | null
    const seen = new Set<string>()

    while ((m = rowRe.exec(body)) !== null) {
      const num = m[1]
      let cellHtml = m[2]
      const hints = extractHints(cellHtml)
      const cellText = stripTags(cellHtml)
      if (cellText.length < 3 || seen.has(num + cellText.slice(0, 20))) continue
      if (!/_{3,}|________/.test(cellHtml) && type !== 'free_text') {
        if (!cellHtml.includes('________________')) continue
      }

      seen.add(num + cellText.slice(0, 20))

      const rawPrompt = cellText.replace(/\s+/g, ' ').trim()
      const blankMatches = [...cellHtml.matchAll(/_{3,}/g)]
      const blanks: BlankDef[] = []

      if (blankMatches.length > 0) {
        for (let b = 0; b < blankMatches.length; b++) {
          const ans = answerTexts[answerIdx++] ?? ''
          if (!ans) continue
          blanks.push({
            index: b,
            accept: [ans],
            hint: hints[b] ?? hints[0] ?? null,
          })
        }
      } else if (type === 'free_text') {
        const ans = answerTexts[answerIdx++] ?? ''
        if (ans) {
          items.push({
            id: `${sourceBase}-${sectionLetter}-${num}`,
            prompt: rawPrompt,
            acceptFull: [ans],
            explanation: { rule: '', topic },
          })
          continue
        }
      }

      if (blanks.length === 0) continue

      const promptNormalized = rawPrompt.replace(/_{3,}/g, '___').replace(/________+/g, '___')
      const { parts } = blanksFromPrompt(promptNormalized)

      items.push({
        id: `${sourceBase}-${sectionLetter}-${num}`,
        prompt: promptNormalized,
        promptParts: parts.map((p) => p.trim()),
        blanks,
        explanation: { rule: '', topic },
      })
    }

    // Chart-style rows: "I am" | "________"
    if (items.length === 0) {
      const chartRe =
        /<tr>[\s\S]*?<td[^>]*>([^<]{3,40})<\/td>[\s\S]*?<td[^>]*>(_{5,})<\/td>/gi
      let chartNum = 0
      while ((m = chartRe.exec(body)) !== null) {
        const label = stripTags(m[1])
        const ans = answerTexts[answerIdx++] ?? ''
        if (!ans || label.match(/^\d+\.$/)) continue
        chartNum++
        items.push({
          id: `${sourceBase}-${sectionLetter}-${chartNum}`,
          prompt: `${label} → ___`,
          promptParts: [`${label} → `, ''],
          blanks: [{ index: 0, accept: [ans], hint: null }],
          explanation: { rule: '', topic },
        })
      }
    }

    // Partial word blanks: Deutsch_____ Brot
    if (items.length === 0) {
      const partialRe =
        /<tr>[\s\S]*?<td[^>]*>\s*(\d+)\.\s*<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/gi
      while ((m = partialRe.exec(body)) !== null) {
        const num = m[1]
        const cellHtml = m[2]
        if (!/\w_{3,}/.test(cellHtml)) continue
        const hints = extractHints(cellHtml)
        const text = stripTags(cellHtml)
        const parts = text.split(/(_{3,})/)
        const blankCount = (cellHtml.match(/_{3,}/g) ?? []).length
        const blanks: BlankDef[] = []
        for (let b = 0; b < blankCount; b++) {
          const ans = answerTexts[answerIdx++]
          if (ans) blanks.push({ index: b, accept: [ans], hint: hints[b] ?? hints[0] ?? null })
        }
        if (blanks.length === 0) continue
        const promptParts = parts.map((p) => (p.match(/^_{3,}$/) ? '' : p))
        items.push({
          id: `${sourceBase}-${sectionLetter}-${num}`,
          prompt: text.replace(/_{3,}/g, '___'),
          promptParts: promptParts.length > 1 ? promptParts : undefined,
          blanks,
          explanation: { rule: '', topic },
        })
      }
    }

    // Two-column numbered: question | answer blank
    if (items.length === 0) {
      const qaRe =
        /<tr>[\s\S]*?<td[^>]*>\s*(\d+)\.\s*<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>(_{5,})<\/td>/gi
      while ((m = qaRe.exec(body)) !== null) {
        const num = m[1]
        const prompt = stripTags(m[2])
        const ans = answerTexts[answerIdx++] ?? ''
        if (!ans || prompt.length < 5) continue
        items.push({
          id: `${sourceBase}-${sectionLetter}-${num}`,
          prompt,
          acceptFull: [ans],
          explanation: { rule: '', topic },
        })
      }
      if (items.length > 0) return { id: `${sourceBase}-${sectionLetter}`, type: 'free_text', instructions: instructions || header, items }
    }

    if (items.length === 0 && tableItems.length > 0) {
      tableItems.forEach((text, idx) => {
        if (!/_{3,}|________/.test(text)) return
        const { parts, count } = blanksFromPrompt(text.replace(/_{3,}/g, '___'))
        const blanks: BlankDef[] = []
        for (let b = 0; b < count; b++) {
          const ans = answerTexts[answerIdx++]
          if (ans) blanks.push({ index: b, accept: [ans], hint: null })
        }
        if (blanks.length === 0) return
        items.push({
          id: `${sourceBase}-${sectionLetter}-${idx + 1}`,
          prompt: text.replace(/_{3,}/g, '___'),
          promptParts: parts.map((p) => p.trim()),
          blanks,
          explanation: { rule: '', topic },
        })
      })
    }

    if (items.length === 0) {
      const paragraphMatch = body.match(
        /<td class="norm" align="left" valign="top">([\s\S]*?)<\/td>/,
      )
      if (paragraphMatch) {
        const paraHtml = paragraphMatch[1]
        const paraText = stripTags(paraHtml)
        const blankCount = (paraHtml.match(/_{3,}/g) ?? []).length
        if (blankCount > 0) {
          const { parts } = blanksFromPrompt(paraText.replace(/_{3,}/g, '___'))
          const blanks: BlankDef[] = []
          for (let b = 0; b < blankCount; b++) {
            const ans = answerTexts[answerIdx++]
            if (ans) blanks.push({ index: b, accept: [ans], hint: null })
          }
          if (blanks.length > 0) {
            items.push({
              id: `${sourceBase}-${sectionLetter}-1`,
              prompt: paraText.replace(/_{3,}/g, '___'),
              promptParts: parts.map((p) => p.trim()),
              blanks,
              explanation: { rule: '', topic },
            })
          }
        }
      }
    }

    // Multi-row paragraph blanks (e.g. Praeteritum stories)
    if (items.length === 0) {
      const paraRows = [...body.matchAll(
        /<tr><td class="norm"[^>]*>([\s\S]*?)<\/td><\/tr>/gi,
      )]
      let paraNum = 0
      for (const row of paraRows) {
        const paraHtml = row[1]
        if (!/_{3,}/.test(paraHtml)) continue
        const hints = extractHints(paraHtml)
        const paraText = stripTags(paraHtml)
        const blankCount = (paraHtml.match(/_{3,}/g) ?? []).length
        const blanks: BlankDef[] = []
        for (let b = 0; b < blankCount; b++) {
          const ans = answerTexts[answerIdx++]
          if (ans) blanks.push({ index: b, accept: [ans], hint: hints[b] ?? null })
        }
        if (blanks.length === 0) continue
        paraNum++
        const { parts } = blanksFromPrompt(paraText.replace(/_{3,}/g, '___'))
        items.push({
          id: `${sourceBase}-${sectionLetter}-${paraNum}`,
          prompt: paraText.replace(/_{3,}/g, '___'),
          promptParts: parts.map((p) => p.trim()),
          blanks,
          explanation: { rule: '', topic },
        })
      }
    }
  }

  if (items.length === 0) return null

  return {
    id: `${sourceBase}-${sectionLetter}`,
    type,
    instructions: instructions || header,
    items,
  }
}

function loadSummary(sectionId: string): OverviewBlock[] {
  const summaries = JSON.parse(fs.readFileSync(SUMMARIES_PATH, 'utf-8')) as Record<
    string,
    { blocks: OverviewBlock[] }
  >
  return summaries[sectionId]?.blocks ?? []
}

function parseWorksheet(entry: CurriculumEntry): GrammarSection | null {
  const wsHtml = readHtml(entry.sourceFile)
  const antwFile = entry.sourceFile.replace(/\.html$/, 'antw.html')
  const antwHtml = readHtml(antwFile)
  if (!wsHtml || !antwHtml) return null

  const titleMatch = wsHtml.match(/<span class="titleu">([^<]+)<\/span>/)
  const title = titleMatch ? stripTags(titleMatch[1]).replace(/^Arbeitsblatt:\s*/i, '') : entry.title

  const summaryBlocks = loadSummary(entry.id)
  const topic = entry.topic ?? inferTopic(entry.id)

  const wsSections = splitSections(wsHtml)
  const antwSections = splitSections(antwHtml)

  const exercises: Exercise[] = []

  for (const ws of wsSections) {
    const antw = antwSections.find((a) => a.letter === ws.letter)
    const instructions = extractInstructions(ws.body)
    const ex = parseWorksheetSection(
      ws.letter,
      ws.header,
      instructions,
      ws.body,
      antw?.body ?? '',
      entry.sourceFile.replace('.html', ''),
      topic,
    )
    if (ex) exercises.push(ex)
  }

  if (exercises.length === 0) return null

  return {
    id: entry.id,
    level: entry.level,
    title,
    group: entry.group,
    sourceFile: entry.sourceFile,
    overviewSource: entry.overviewSource,
    overview: { blocks: summaryBlocks },
    exercises,
  }
}

function main() {
  if (!fs.existsSync(MATERIALS)) {
    console.error(
      'Source materials not found at materials/html_textbook/grammar_pages/.\n' +
        'This folder is private and not part of the public repo.\n' +
        'The app builds from committed content/ JSON — run npm run build instead.',
    )
    process.exit(1)
  }

  const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8')) as {
    sections: CurriculumEntry[]
  }

  fs.mkdirSync(CONTENT, { recursive: true })

  const report = { parsed: 0, skipped: 0, failed: [] as string[], exercises: 0 }

  for (const entry of curriculum.sections) {
    try {
      const section = parseWorksheet(entry)
      if (!section) {
        report.skipped++
        report.failed.push(`${entry.id}: no exercises parsed`)
        continue
      }
      fs.writeFileSync(
        path.join(CONTENT, `${entry.id}.json`),
        JSON.stringify(section, null, 2),
        'utf-8',
      )
      report.parsed++
      report.exercises += section.exercises.length
      console.log(`✓ ${entry.id}: ${section.exercises.length} exercises`)
    } catch (e) {
      report.skipped++
      report.failed.push(`${entry.id}: ${e}`)
      console.error(`✗ ${entry.id}:`, e)
    }
  }

  fs.writeFileSync(path.join(ROOT, 'content/parse-report.json'), JSON.stringify(report, null, 2))
  console.log(`\nDone: ${report.parsed} sections, ${report.exercises} exercises, ${report.skipped} skipped`)
}

main()
