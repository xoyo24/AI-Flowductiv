import type { ParsedActivity } from '~/types/activity'

export class InputParserService {
  /**
   * Parse a complete activity input string into structured data
   */
  static parseActivity(input: string): ParsedActivity {
    const tags = this.extractTags(input)
    const priority = this.extractPriority(input)
    const cleanText = this.cleanText(input)

    return {
      originalText: input,
      cleanText,
      tags,
      priority
    }
  }

  /**
   * Extract tags from input text (e.g., #work #urgent #ai-coding #v2.0)
   * Automatically deduplicates tags and preserves order of first occurrence
   */
  static extractTags(text: string): string[] {
    const tagRegex = /#([\w.-]+)/g
    const tags = Array.from(text.matchAll(tagRegex), (match) => match[1])
    
    // Remove duplicates while preserving order
    return [...new Set(tags)]
  }

  /**
   * Extract priority from input text (e.g., !1, !2, !3)
   */
  static extractPriority(text: string): number | null {
    const priorityMatch = text.match(/!([1-3])/)
    return priorityMatch ? Number.parseInt(priorityMatch[1]) : null
  }

  /**
   * Remove tags and priority markers from text, returning clean display text
   */
  static cleanText(text: string): string {
    return text
      .replace(/#[\w.-]+/g, '') // Remove tags (including hyphens, dots, underscores)
      .replace(/!\d+/g, '') // Remove all priority markers (valid and invalid)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim() // Remove leading/trailing whitespace
  }
}