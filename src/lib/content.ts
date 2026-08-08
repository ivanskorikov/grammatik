import type { Curriculum, GrammarSection } from '../types'

import curriculumData from '../../content/curriculum.json'

const sectionModules = import.meta.glob<{ default: GrammarSection }>(
  '../../content/sections/*.json',
  { eager: true },
)

export const curriculum = curriculumData as Curriculum

export function getSectionsForLevel(level: 'A1' | 'A2'): GrammarSection[] {
  const ids = curriculum.sections.filter((s) => s.level === level).map((s) => s.id)
  return ids
    .map((id) => {
      const mod = sectionModules[`../../content/sections/${id}.json`]
      return mod?.default ?? null
    })
    .filter((s): s is GrammarSection => s !== null)
}

export function getSection(sectionId: string): GrammarSection | null {
  const mod = sectionModules[`../../content/sections/${sectionId}.json`]
  return mod?.default ?? null
}

export function getCurriculumEntry(sectionId: string) {
  return curriculum.sections.find((s) => s.id === sectionId) ?? null
}

export function groupSections(sections: GrammarSection[]): Record<string, GrammarSection[]> {
  const groups: Record<string, GrammarSection[]> = {}
  for (const s of sections) {
    if (!groups[s.group]) groups[s.group] = []
    groups[s.group].push(s)
  }
  return groups
}
