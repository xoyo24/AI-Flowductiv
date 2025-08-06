export type GoalType = 'time' | 'activity_count' | 'streak' | 'focus_rating'
export type GoalPeriod = 'daily' | 'weekly' | 'monthly'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived'

export interface Goal {
  id: string
  title: string
  description?: string
  type: GoalType
  period: GoalPeriod
  target: number
  targetUnit?: string // e.g., 'hours', 'activities', 'days', 'rating'
  status: GoalStatus
  startDate: Date
  endDate?: Date
  tags?: string[] // Optional: filter activities by tags for this goal
  priority?: number // Optional: only count activities with certain priority
  userId?: string
  createdAt: Date
  updatedAt: Date
}

export interface NewGoal {
  title: string
  description?: string
  type: GoalType
  period: GoalPeriod
  target: number
  targetUnit?: string
  status?: GoalStatus
  startDate?: Date
  endDate?: Date
  tags?: string[]
  priority?: number
  userId?: string
}

export interface GoalProgress {
  goalId: string
  currentValue: number
  targetValue: number
  progressPercentage: number
  isCompleted: boolean
  periodStart: Date
  periodEnd: Date
  lastUpdated: Date
}

export interface GoalSuggestion {
  type: GoalType
  period: GoalPeriod
  target: number
  targetUnit: string
  title: string
  description: string
  reasoning: string // AI explanation why this goal is suggested
  confidence: number // 0-100 confidence score
}

export interface GoalMetrics {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  completionRate: number // percentage
  averageProgress: number // percentage
  streakDays: number
}
