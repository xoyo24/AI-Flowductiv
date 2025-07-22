// Startup validation for AI provider API keys
// Runs once when server starts to ensure proper configuration

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  
  console.log('🔑 Validating AI provider API keys...')
  
  const validationResults = {
    anthropic: false,
    openai: false,
    hasValidProvider: false
  }
  
  // Validate Anthropic API key
  if (config.anthropicApiKey) {
    try {
      // Quick validation - check if key format is correct
      if (config.anthropicApiKey.startsWith('sk-ant-')) {
        validationResults.anthropic = true
        console.log('✅ Anthropic API key format is valid')
      } else {
        console.warn('⚠️  Anthropic API key format is invalid (should start with sk-ant-)')
      }
    } catch (error) {
      console.warn('⚠️  Anthropic API key validation failed:', error)
    }
  } else {
    console.log('ℹ️  Anthropic API key not configured')
  }
  
  // Validate OpenAI API key
  if (config.openaiApiKey) {
    try {
      // Quick validation - check if key format is correct
      if (config.openaiApiKey.startsWith('sk-')) {
        validationResults.openai = true
        console.log('✅ OpenAI API key format is valid')
      } else {
        console.warn('⚠️  OpenAI API key format is invalid (should start with sk-)')
      }
    } catch (error) {
      console.warn('⚠️  OpenAI API key validation failed:', error)
    }
  } else {
    console.log('ℹ️  OpenAI API key not configured')
  }
  
  // Check if at least one provider is available
  validationResults.hasValidProvider = validationResults.anthropic || validationResults.openai
  
  if (validationResults.hasValidProvider) {
    console.log('✅ AI providers ready - at least one valid API key found')
  } else {
    console.warn('⚠️  No valid AI provider API keys found - AI features will use fallback mode')
    console.log('   Configure ANTHROPIC_API_KEY or OPENAI_API_KEY environment variables')
  }
  
  // Store validation results for runtime use
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    // Add validation status to runtime context if needed
    if (event.node.req.url?.startsWith('/api/ai/')) {
      event.context.aiValidation = validationResults
    }
  })
  
  console.log('🚀 API key validation complete')
})