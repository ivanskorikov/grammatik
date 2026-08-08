import type { CheckResult, ExerciseItem } from '../types'

export function normalizeGerman(text: string): string {
  let s = text.trim().toLowerCase()
  s = s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  s = s.replace(/[.,!?;:]+$/g, '')
  s = s.replace(/\s+/g, ' ')
  return s
}

export function answersMatch(given: string, expected: string[]): boolean {
  const norm = normalizeGerman(given)
  if (!norm) return false
  return expected.some((a) => normalizeGerman(a) === norm)
}

export function tokenizeSentence(s: string): string[] {
  return normalizeGerman(s)
    .split(/\s+/)
    .filter(Boolean)
}

export function sentenceMatches(given: string, expected: string[]): boolean {
  const givenTokens = tokenizeSentence(given)
  return expected.some((exp) => {
    const expTokens = tokenizeSentence(exp)
    if (givenTokens.length !== expTokens.length) return false
    return givenTokens.every((t, i) => t === expTokens[i])
  })
}

export function checkBlank(
  given: string,
  accept: string[],
): boolean {
  return answersMatch(given, accept)
}

export function checkItem(
  item: ExerciseItem,
  answers: Record<string, string>,
  type: string,
): CheckResult[] {
  const results: CheckResult[] = []

  if (type === 'word_order' || type === 'free_text') {
    const given = answers[item.id] ?? ''
    const expected = item.acceptFull ?? []
    results.push({
      itemId: item.id,
      correct: sentenceMatches(given, expected),
      given,
      expected,
      explanation: item.explanation,
    })
    return results
  }

  if (item.blanks) {
    for (const blank of item.blanks) {
      const key = `${item.id}:${blank.index}`
      const given = answers[key] ?? ''
      results.push({
        itemId: item.id,
        blankIndex: blank.index,
        correct: checkBlank(given, blank.accept),
        given,
        expected: blank.accept,
        explanation: item.explanation,
      })
    }
  }

  return results
}

export function scoreResults(results: CheckResult[]): { correct: number; total: number } {
  return {
    correct: results.filter((r) => r.correct).length,
    total: results.length,
  }
}

export function buildExplanation(
  result: CheckResult,
  hint: string | null,
  topicRule?: string,
): { title: string; body: string } {
  const expected = result.expected.join(' or ')
  const title = result.correct ? 'Correct!' : 'Incorrect'

  if (result.correct) {
    return { title, body: `Well done — **${expected}** is correct.` }
  }

  const parts: string[] = []
  if (result.given) {
    parts.push(`You wrote **${result.given}**, but the expected answer is **${expected}**.`)
  } else {
    parts.push(`The expected answer is **${expected}**.`)
  }

  if (hint) {
    parts.push(`Hint: ${hint}`)
  }

  if (topicRule) {
    parts.push(topicRule)
  } else if (result.explanation?.rule) {
    parts.push(result.explanation.rule)
  }

  return { title, body: parts.join(' ') }
}

export function getTopicRule(topic: string): string | undefined {
  const rules: Record<string, string> = {
    'accusative-articles':
      'Masculine nouns take **den** in accusative; feminine/neuter keep **die**/**das**.',
    'nominative-articles': 'Subjects use nominative articles: **der/die/das**.',
    'indefinite-articles':
      'Indefinite articles change in accusative: **ein → einen** (masc.), **eine** (fem.) stays.',
    'verb-conjugation': 'Match the verb ending to the subject (ich -e, du -st, er/sie -t, wir -en).',
    dative: 'Dative objects take **dem/der/dem/den** (m/n/f/pl).',
    'word-order':
      'In subordinate clauses the conjugated verb goes to the end.',
    perfekt: 'Perfekt = **haben/sein** + past participle at the end.',
  }
  return rules[topic]
}

export function explainResult(
  result: CheckResult,
  hint: string | null = null,
): { title: string; body: string } {
  const topicRule = result.explanation?.topic
    ? getTopicRule(result.explanation.topic)
    : undefined
  return buildExplanation(result, hint, topicRule)
}
