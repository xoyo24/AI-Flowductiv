<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="closeDialog"
    />
    
    <!-- Dialog -->
    <div class="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col overflow-hidden
                md:max-h-[85vh] sm:mx-2 sm:max-w-[calc(100vw-1rem)]">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 sm:p-6 border-b border-border">
        <div class="flex items-center space-x-3">
          <BarChart3 class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-semibold">Analytics & Insights</h2>
        </div>
        <button
          @click="closeDialog"
          class="p-2 rounded-md hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="px-4 sm:px-6 pt-4">
        <nav class="flex space-x-1 border-b border-border overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap min-h-[44px]',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ tab.label }}</span>
            <span class="sm:hidden">{{ tab.label.split(' ')[0] }}</span>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="space-y-4 sm:space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <!-- Today Stats -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Clock class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Today</span>
              </div>
              <div class="text-2xl font-bold">{{ todayTimeFormatted }}</div>
              <div class="text-xs text-muted-foreground">
                {{ todayStats.activitiesCount }} activities
                <span v-if="todayStats.avgFocus > 0">
                  • {{ todayStats.avgFocus.toFixed(1) }}/5 focus
                </span>
              </div>
            </div>

            <!-- This Week -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Calendar class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">This Week</span>
              </div>
              <div class="text-2xl font-bold">{{ weekTimeFormatted }}</div>
              <div class="text-xs text-muted-foreground">
                {{ weekStats.activitiesCount }} activities
              </div>
            </div>

            <!-- Total Tracked -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Target class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Total Tracked</span>
              </div>
              <div class="text-2xl font-bold">{{ totalTimeFormatted }}</div>
              <div class="text-xs text-muted-foreground">
                {{ totalStats.activitiesCount }} activities
              </div>
            </div>
          </div>

          <!-- Quick Insights -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Quick Insights</h3>
            
            <!-- Peak Hours -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <TrendingUp class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Peak Performance Hours</span>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ peakHoursText }}
              </div>
            </div>

            <!-- Focus Pattern -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Brain class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Focus Patterns</span>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ focusPatternText }}
              </div>
            </div>

            <!-- Top Categories -->
            <div class="bg-secondary/20 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Tag class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm font-medium">Top Categories</span>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="category in topCategories.slice(0, 3)" 
                  :key="category.name"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="text-muted-foreground">#{{ category.name }}</span>
                  <span class="font-medium">{{ category.percentage }}%</span>
                </div>
                <div v-if="topCategories.length === 0" class="text-sm text-muted-foreground">
                  Add tags to see category breakdown
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Insights Tab -->
        <div v-else-if="activeTab === 'ai-insights'" class="space-y-6">
          <!-- Loading State -->
          <div v-if="aiLoading" class="text-center py-8">
            <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-muted-foreground">Generating AI insights...</p>
          </div>
          
          <!-- AI Insights Available -->
          <div v-else-if="hasAIInsights && aiInsights" class="space-y-6">
            <!-- Header with Summary -->
            <div class="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
              <div class="flex items-center space-x-3 mb-3">
                <Brain class="w-6 h-6 text-primary" />
                <h3 class="text-lg font-semibold">AI Analysis Complete</h3>
              </div>
              <p class="text-sm text-muted-foreground">
                Based on your {{ totalStats.activitiesCount }} activities and productivity patterns
              </p>
            </div>

            <!-- Peak Hours Insight -->
            <div v-if="aiInsights.peakHours" class="bg-secondary/20 rounded-lg p-5">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <TrendingUp class="w-5 h-5 text-primary" />
                  <h4 class="font-semibold">Peak Performance Hours</h4>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-xs text-muted-foreground">
                    {{ Math.round(aiInsights.peakHours.confidence * 100) }}% confidence
                  </span>
                </div>
              </div>
              
              <!-- Visual Time Range -->
              <div class="mb-4">
                <div class="text-2xl font-bold text-primary mb-1">
                  {{ aiInsights.peakHours.timeRange }}
                </div>
                <div class="text-sm text-muted-foreground mb-3">
                  {{ aiInsights.peakHours.avgFocus.toFixed(1) }}/5 avg focus • 
                  {{ aiInsights.peakHours.totalHours.toFixed(1) }}h total
                </div>
                
                <!-- Visual Bar Chart -->
                <div class="bg-muted/50 rounded-lg p-3">
                  <div class="flex items-end space-x-1 h-8 sm:h-12 mb-2">
                    <!-- Mock 24-hour activity bars -->
                    <div v-for="hour in 24" :key="hour" class="flex-1 bg-muted rounded-t min-w-[2px]">
                      <div 
                        class="bg-gradient-to-t from-primary/60 to-primary rounded-t transition-all duration-300 cursor-pointer hover:opacity-80"
                        :class="isPeakHour(hour - 1) ? 'opacity-100' : 'opacity-20'"
                        :style="{ height: getHourBarHeight(hour - 1) }"
                        :title="`${formatHourForDisplay(hour - 1)} - ${isPeakHour(hour - 1) ? 'Peak hour' : 'Regular activity'}`"
                      ></div>
                    </div>
                  </div>
                  <div class="flex justify-between text-xs text-muted-foreground">
                    <span>12 AM</span>
                    <span class="hidden sm:inline">12 PM</span>
                    <span>11 PM</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-primary/5 border-l-4 border-primary rounded p-3">
                <p class="text-sm font-medium text-primary">💡 {{ aiInsights.peakHours.recommendation }}</p>
              </div>
            </div>

            <!-- Focus Pattern Insight -->
            <div v-if="aiInsights.focusPattern" class="bg-secondary/20 rounded-lg p-5">
              <div class="flex items-center space-x-2 mb-3">
                <Brain class="w-5 h-5 text-primary" />
                <h4 class="font-semibold">Focus Trends</h4>
              </div>
              
              <!-- Trend Visualization -->
              <div class="mb-4">
                <div class="flex items-center space-x-4 mb-3">
                  <div class="text-center">
                    <div class="text-2xl font-bold">{{ aiInsights.focusPattern.overallAverage.toFixed(1) }}</div>
                    <div class="text-xs text-muted-foreground">Overall</div>
                  </div>
                  <div class="flex-1 flex items-center">
                    <div class="flex-1 h-2 bg-muted rounded-full relative overflow-hidden">
                      <div 
                        class="h-full bg-gradient-to-r rounded-full transition-all duration-500"
                        :class="getTrendColor(aiInsights.focusPattern.trend)"
                        :style="{ width: `${(aiInsights.focusPattern.recentAverage / 5) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold">{{ aiInsights.focusPattern.recentAverage.toFixed(1) }}</div>
                    <div class="text-xs text-muted-foreground">Recent</div>
                  </div>
                </div>
                
                <div class="flex items-center justify-center space-x-2">
                  <component 
                    :is="getTrendIcon(aiInsights.focusPattern.trend)" 
                    class="w-4 h-4" 
                    :class="getTrendIconColor(aiInsights.focusPattern.trend)"
                  />
                  <span class="text-sm font-medium capitalize">{{ aiInsights.focusPattern.trend }}</span>
                </div>
              </div>
              
              <div class="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded p-3">
                <p class="text-sm font-medium text-blue-700 dark:text-blue-300">
                  💡 {{ aiInsights.focusPattern.suggestion }}
                </p>
              </div>
            </div>

            <!-- Tag Combinations Insight -->
            <div v-if="aiInsights.tagCombinations" class="bg-secondary/20 rounded-lg p-5">
              <div class="flex items-center space-x-2 mb-3">
                <Tag class="w-5 h-5 text-primary" />
                <h4 class="font-semibold">Best Tag Combinations</h4>
              </div>
              
              <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between">
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-for="tag in aiInsights.tagCombinations.bestCombination" 
                      :key="tag"
                      class="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                  <div class="text-right">
                    <div class="font-bold">{{ aiInsights.tagCombinations.averageFocus.toFixed(1) }}/5</div>
                    <div class="text-xs text-muted-foreground">avg focus</div>
                  </div>
                </div>
                
                <!-- Visual Focus Bar -->
                <div class="w-full h-2 bg-muted rounded-full">
                  <div 
                    class="h-full bg-gradient-to-r from-green-500 to-primary rounded-full transition-all duration-500"
                    :style="{ width: `${(aiInsights.tagCombinations.averageFocus / 5) * 100}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 rounded p-3">
                <p class="text-sm font-medium text-green-700 dark:text-green-300">
                  💡 {{ aiInsights.tagCombinations.recommendation }}
                </p>
              </div>
            </div>

            <!-- Actionable Recommendations -->
            <div v-if="aiInsights.recommendations && aiInsights.recommendations.length > 0" class="space-y-3">
              <h4 class="font-semibold flex items-center space-x-2">
                <Lightbulb class="w-5 h-5 text-yellow-500" />
                <span>Smart Recommendations</span>
              </h4>
              
              <div 
                v-for="(rec, index) in aiInsights.recommendations" 
                :key="index"
                class="bg-white dark:bg-card border rounded-lg p-4 shadow-sm"
              >
                <div class="flex items-start space-x-3">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    :class="getPriorityStyle(rec.priority)"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-medium text-muted-foreground uppercase">
                        {{ rec.type }}
                      </span>
                      <span class="text-xs text-muted-foreground">
                        {{ Math.round(rec.confidence * 100) }}% confidence
                      </span>
                    </div>
                    <p class="text-sm">{{ rec.message }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="flex justify-center pt-4">
              <button 
                @click="generateNewInsights"
                class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium min-h-[44px] min-w-[120px] disabled:opacity-50"
                :disabled="aiLoading"
              >
                <span v-if="!aiLoading">Refresh Analysis</span>
                <span v-else class="flex items-center space-x-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </span>
              </button>
            </div>
          </div>
          
          <!-- Enable AI State -->
          <div v-else class="text-center py-8">
            <Brain class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">AI-Powered Insights</h3>
            <p class="text-muted-foreground mb-6 max-w-md mx-auto">
              Get personalized productivity coaching and smart recommendations based on your activity patterns.
            </p>
            
            <div class="space-y-4">
              <div class="bg-secondary/20 rounded-lg p-4">
                <div class="text-sm text-muted-foreground">
                  Generate AI insights to get personalized productivity coaching and recommendations.
                </div>
              </div>
              <button 
                @click="generateNewInsights"
                class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[44px] min-w-[140px] disabled:opacity-50"
                :disabled="aiLoading"
              >
                <span v-if="!aiLoading">Generate AI Insights</span>
                <span v-else class="flex items-center space-x-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" class="space-y-4 sm:space-y-6">
          <div>
            <h3 class="text-lg font-semibold mb-4">AI & Analytics Settings</h3>
            
            <div class="space-y-4">
              <!-- Cost Tracking Overview -->
              <div v-if="aiSettings.isCostTrackingEnabled" class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div class="flex items-center space-x-2 mb-3">
                  <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-green-700 dark:text-green-300">$</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-green-800 dark:text-green-200">Monthly AI Usage</h4>
                    <p class="text-xs text-green-600 dark:text-green-400">Budget tracking enabled</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div class="bg-white dark:bg-card rounded-lg p-3 text-center">
                    <div class="text-lg font-bold">${{ (aiSettings.currentMonthCost || 0).toFixed(3) }}</div>
                    <div class="text-xs text-muted-foreground">This month</div>
                  </div>
                  <div class="bg-white dark:bg-card rounded-lg p-3 text-center">
                    <div class="text-lg font-bold">${{ (aiSettings.remainingBudget || 0).toFixed(2) }}</div>
                    <div class="text-xs text-muted-foreground">Remaining</div>
                  </div>
                  <div class="bg-white dark:bg-card rounded-lg p-3 text-center col-span-2 sm:col-span-1">
                    <div class="text-lg font-bold">{{ Math.round(aiSettings.budgetUtilization || 0) }}%</div>
                    <div class="text-xs text-muted-foreground">Used</div>
                  </div>
                </div>
                
                <!-- Budget Progress Bar -->
                <div class="mb-3">
                  <div class="flex justify-between text-xs mb-1">
                    <span>Budget Usage</span>
                    <span>${{ aiSettings.monthlyLimit || 10 }}</span>
                  </div>
                  <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      class="h-full rounded-full transition-all duration-300"
                      :class="(aiSettings.budgetUtilization || 0) >= 90 ? 'bg-red-500' : (aiSettings.budgetUtilization || 0) >= 70 ? 'bg-yellow-500' : 'bg-green-500'"
                      :style="{ width: `${Math.min(100, aiSettings.budgetUtilization || 0)}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- AI Provider Selection -->
              <div class="bg-secondary/20 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <Settings class="w-4 h-4 text-muted-foreground" />
                    <span class="text-sm font-medium">AI Provider</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <div class="w-2 h-2 rounded-full" :class="aiSettings.getCurrentProviderStatus.available ? 'bg-green-500' : 'bg-red-500'"></div>
                    <span class="text-xs text-muted-foreground">
                      {{ aiSettings.getCurrentProviderStatus.available ? 'Online' : 'Offline' }}
                    </span>
                  </div>
                </div>
                
                <!-- Current Provider -->
                <div class="mb-4">
                  <div class="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div>
                      <div class="font-medium">{{ aiSettings.getProviderDisplayName(aiSettings.currentProvider) }}</div>
                      <div class="text-xs text-muted-foreground">Current provider</div>
                    </div>
                    <div class="text-right">
                      <span 
                        class="px-2 py-1 text-xs rounded-full"
                        :class="`bg-${aiSettings.getProviderBadge(aiSettings.currentProvider).color}-100 text-${aiSettings.getProviderBadge(aiSettings.currentProvider).color}-700 dark:bg-${aiSettings.getProviderBadge(aiSettings.currentProvider).color}-950 dark:text-${aiSettings.getProviderBadge(aiSettings.currentProvider).color}-300`"
                      >
                        {{ aiSettings.getProviderBadge(aiSettings.currentProvider).text }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Available Providers -->
                <div class="space-y-2 mb-4">
                  <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available Providers</div>
                  <div 
                    v-for="provider in aiSettings.getProvidersSortedByCost()" 
                    :key="provider"
                    class="flex items-center justify-between p-2 rounded-lg border transition-colors hover:bg-muted/50"
                    :class="provider === aiSettings.currentProvider ? 'border-primary bg-primary/5' : 'border-border'"
                  >
                    <div class="flex items-center space-x-3">
                      <div 
                        class="w-3 h-3 rounded-full"
                        :class="aiSettings.providerStatus[provider].available ? 'bg-green-500' : 'bg-gray-400'"
                      ></div>
                      <span class="text-sm">{{ aiSettings.getProviderDisplayName(provider) }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span 
                        class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {{ aiSettings.getProviderBadge(provider).text }}
                      </span>
                      <button
                        v-if="provider !== aiSettings.currentProvider && aiSettings.providerStatus[provider].available"
                        @click="aiSettings.setProvider(provider)"
                        class="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      >
                        Switch
                      </button>
                    </div>
                  </div>
                </div>

                <!-- AI Settings Controls -->
                <div class="space-y-3 pt-3 border-t border-border">
                  <label class="flex items-center justify-between">
                    <span class="text-sm">Cost tracking</span>
                    <button
                      @click="aiSettings.toggleCostTracking()"
                      class="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      :class="aiSettings.isCostTrackingEnabled ? 'bg-primary' : ''"
                    >
                      <div
                        class="w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200"
                        :class="aiSettings.isCostTrackingEnabled ? 'translate-x-5' : 'translate-x-0'"
                      ></div>
                    </button>
                  </label>
                  
                  <label class="flex items-center justify-between">
                    <span class="text-sm">Fallback to mock data</span>
                    <button
                      @click="aiSettings.toggleFallback()"
                      class="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      :class="aiSettings.canFallback ? 'bg-primary' : ''"
                    >
                      <div
                        class="w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200"
                        :class="aiSettings.canFallback ? 'translate-x-5' : 'translate-x-0'"
                      ></div>
                    </button>
                  </label>
                </div>
              </div>

              <!-- Data Range -->
              <div class="bg-secondary/20 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <Calendar class="w-4 h-4 text-muted-foreground" />
                  <span class="text-sm font-medium">Data Range</span>
                </div>
                <div class="text-sm text-muted-foreground">
                  Analytics are calculated from your last 100 activities or 30 days, whichever is more recent.
                </div>
              </div>

              <!-- Export Options -->
              <div class="bg-secondary/20 rounded-lg p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <Download class="w-4 h-4 text-muted-foreground" />
                  <span class="text-sm font-medium">Export Data</span>
                </div>
                <div class="text-sm text-muted-foreground mb-3">
                  Export your productivity data and insights.
                </div>
                <div class="flex flex-wrap gap-2">
                  <button class="px-3 py-1 text-xs bg-muted text-muted-foreground rounded border hover:bg-muted/80 transition-colors">
                    Export (Coming Soon)
                  </button>
                  <button 
                    v-if="aiSettings.isCostTrackingEnabled"
                    @click="aiSettings.resetMonthlyUsage()"
                    class="px-3 py-1 text-xs bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-950/40 transition-colors"
                  >
                    Reset Usage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  BarChart3, 
  Brain, 
  Calendar, 
  Clock, 
  Download, 
  Lightbulb,
  Settings, 
  Tag, 
  Target, 
  TrendingUp,
  TrendingDown,
  Minus,
  X 
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useActivities } from '~/composables/useActivities'
import { useInsights } from '~/composables/useInsights'
import { useAISettings } from '~/composables/useAISettings'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { getActivities } = useActivities()
const { 
  insights: aiInsights,
  hasInsights: hasAIInsights,
  loading: aiLoading,
  generateInsights 
} = useInsights()
const aiSettings = useAISettings()

// State
const activeTab = ref('overview')
const loading = ref(false)

// Stats
const todayStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })
const weekStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })
const totalStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })
const peakHours = ref<string[]>([])
const focusPattern = ref<string>('')
const topCategories = ref<Array<{ name: string; percentage: number; totalTime: number }>>([])

// Tab configuration
const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'ai-insights', label: 'AI Insights', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings }
]

// Computed
const todayTimeFormatted = computed(() => formatTime(todayStats.value.totalTime))
const weekTimeFormatted = computed(() => formatTime(weekStats.value.totalTime))
const totalTimeFormatted = computed(() => formatTime(totalStats.value.totalTime))

const peakHoursText = computed(() => {
  if (peakHours.value.length === 0) {
    return 'Track more activities to identify your peak performance hours'
  }
  return `Most productive during: ${peakHours.value.join(', ')}`
})

const focusPatternText = computed(() => {
  return focusPattern.value || 'Rate your sessions to see focus patterns'
})

const aiProvider = computed(() => {
  return 'Claude' // TODO: Get from AI settings
})

// AI Insights Visualization Methods
const isPeakHour = (hour: number): boolean => {
  if (!aiInsights.value?.peakHours) return false
  const range = aiInsights.value.peakHours.timeRange
  // Parse the time range to determine peak hours
  // This is a simplified implementation - could be enhanced
  return range.includes(formatHourForDisplay(hour))
}

const getHourBarHeight = (hour: number): string => {
  // Mock implementation - in reality, this would be based on actual activity data
  const baseHeight = isPeakHour(hour) ? 80 : 30
  const variation = Math.random() * 20
  return `${baseHeight + variation}%`
}

const formatHourForDisplay = (hour: number): string => {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

const getTrendColor = (trend: string): string => {
  switch (trend) {
    case 'improving': return 'from-green-400 to-green-600'
    case 'declining': return 'from-red-400 to-red-600'
    case 'stable': return 'from-blue-400 to-blue-600'
    default: return 'from-gray-400 to-gray-600'
  }
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'improving': return TrendingUp
    case 'declining': return TrendingDown
    case 'stable': return Minus
    default: return Minus
  }
}

const getTrendIconColor = (trend: string): string => {
  switch (trend) {
    case 'improving': return 'text-green-600'
    case 'declining': return 'text-red-600'
    case 'stable': return 'text-blue-600'
    default: return 'text-gray-600'
  }
}

const getPriorityStyle = (priority: string): string => {
  switch (priority) {
    case 'high': return 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-300'
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300'
    case 'low': return 'bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300'
    default: return 'bg-gray-100 dark:bg-gray-950/20 text-gray-700 dark:text-gray-300'
  }
}

const generateNewInsights = async () => {
  try {
    const activities = await getActivities(1, 100)
    await generateInsights(activities)
  } catch (error) {
    console.error('Failed to generate insights:', error)
  }
}

// Methods
const closeDialog = () => {
  emit('close')
}

const formatTime = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const loadAnalytics = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const activities = await getActivities(1, 100)
    
    if (activities.length === 0) {
      loading.value = false
      return
    }

    // Calculate date ranges
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    // Filter activities by time periods
    const todayActivities = activities.filter(a => new Date(a.startTime) >= startOfToday)
    const weekActivities = activities.filter(a => new Date(a.startTime) >= startOfWeek)

    // Calculate stats for each period
    const calculateStats = (acts: typeof activities) => {
      const totalTime = acts.reduce((sum, a) => sum + a.durationMs, 0)
      const ratedActivities = acts.filter(a => a.focusRating !== null)
      const avgFocus = ratedActivities.length > 0 
        ? ratedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / ratedActivities.length
        : 0
      
      return { totalTime, activitiesCount: acts.length, avgFocus }
    }

    todayStats.value = calculateStats(todayActivities)
    weekStats.value = calculateStats(weekActivities)
    totalStats.value = calculateStats(activities)

    // Calculate peak hours
    const hourMap = new Map<number, number>()
    activities.forEach((activity) => {
      const hour = new Date(activity.startTime).getHours()
      hourMap.set(hour, (hourMap.get(hour) || 0) + activity.durationMs)
    })

    const sortedHours = Array.from(hourMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([hour]) => {
        if (hour === 0) return '12 AM'
        if (hour === 12) return '12 PM'
        if (hour < 12) return `${hour} AM`
        return `${hour - 12} PM`
      })

    peakHours.value = sortedHours

    // Calculate focus pattern
    const ratedActivities = activities.filter((a) => a.focusRating !== null)
    if (ratedActivities.length >= 3) {
      const averageFocus = ratedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / ratedActivities.length
      const recentAvg = ratedActivities.slice(0, 10).reduce((sum, a) => sum + (a.focusRating || 0), 0) / Math.min(10, ratedActivities.length)

      if (recentAvg > averageFocus + 0.5) {
        focusPattern.value = 'Focus improving recently ↗'
      } else if (recentAvg < averageFocus - 0.5) {
        focusPattern.value = 'Focus declining lately ↘'
      } else {
        focusPattern.value = `Steady ${averageFocus.toFixed(1)}/5 focus avg`
      }
    } else {
      focusPattern.value = 'Rate your sessions to see focus patterns'
    }

    // Calculate top categories
    const tagMap = new Map<string, number>()
    let totalTime = 0

    activities.forEach((activity) => {
      totalTime += activity.durationMs
      activity.tags?.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + activity.durationMs)
      })
    })

    if (totalTime > 0) {
      const categories = Array.from(tagMap.entries())
        .map(([name, time]) => ({
          name,
          totalTime: time,
          percentage: Math.round((time / totalTime) * 100),
        }))
        .sort((a, b) => b.totalTime - a.totalTime)

      topCategories.value = categories
    } else {
      topCategories.value = []
    }

  } catch (error) {
    console.error('Failed to load analytics:', error)
  } finally {
    loading.value = false
  }
}

// Load data when dialog opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadAnalytics()
  }
})

// Handle escape key to close dialog
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      closeDialog()
    }
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>