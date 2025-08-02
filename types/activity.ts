export interface ParsedActivity {
  originalText: string
  cleanText: string
  tags: string[]
  priority: number | null
  focusRating: number | null
}

export interface ActivitySuggestion {
  id: string
  text: string
  type: 'activity' | 'tag'
  frequency: number
  lastUsed: Date
}

export interface AutoCompleteResult {
  suggestions: ActivitySuggestion[]
  isLoading: boolean
  error: string | null
}
