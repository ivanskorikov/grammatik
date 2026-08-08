export type ExerciseType =
  | 'fill_blank'
  | 'fill_blank_with_hint'
  | 'word_bank'
  | 'word_order'
  | 'pick_and_type'
  | 'free_text'

export interface BlankDef {
  index: number
  accept: string[]
  hint: string | null
}

export interface ItemExplanation {
  rule: string
  topic: string
}

export interface ExerciseItem {
  id: string
  prompt: string
  promptParts?: string[]
  blanks?: BlankDef[]
  wordBank?: string[]
  acceptFull?: string[]
  explanation?: ItemExplanation
}

export interface Exercise {
  id: string
  type: ExerciseType
  instructions: string
  items: ExerciseItem[]
}

export interface OverviewBlock {
  type: 'heading' | 'paragraph' | 'table' | 'list' | 'example'
  content: string
  rows?: string[][]
  de?: string
  note?: string
}

export interface GrammarSection {
  id: string
  level: 'A1' | 'A2'
  title: string
  group: string
  sourceFile: string
  overviewSource?: string
  overview: { blocks: OverviewBlock[] }
  exercises: Exercise[]
}

export interface CurriculumEntry {
  id: string
  level: 'A1' | 'A2'
  title: string
  group: string
  sourceFile: string
  overviewSource?: string
}

export interface Curriculum {
  levels: { id: 'A1' | 'A2'; label: string; description: string }[]
  sections: CurriculumEntry[]
}

export interface ExerciseScore {
  correct: number
  total: number
  lastChecked: string
}

export interface Progress {
  completedSections: string[]
  exerciseScores: Record<string, ExerciseScore>
  lastVisited: { level: 'A1' | 'A2'; sectionId: string } | null
}

export interface CheckResult {
  itemId: string
  blankIndex?: number
  correct: boolean
  given: string
  expected: string[]
  explanation?: ItemExplanation
}
